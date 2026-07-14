const {WebSocketServer}=require('ws')
const jwt=require('jsonwebtoken')
const { getSession, setSession } = require('./session')
const Class = require('../models/Class')
const Attendance = require('../models/Attendance')

const setupWebSocket=(server)=>{
    const wss=new WebSocketServer({server, path:'/ws'})

    wss.on('connection', (ws,req)=>{
        const url=new URL(req.url, 'http://localhost:3000')
        const token=url.searchParams.get('token');

        if(!token){
            ws.send(JSON.stringify({event:'ERROR', data:{message:'Unauthorized or invalid token'}}))
            ws.close()
            return
        }
        try{
            const decoded=jwt.verify(token, process.env.JWT_SECRET)
            ws.user={userId:decoded.userId, role:decoded.role}
            console.log(`${ws.user.role} connected`)
        }
        catch(err){
            ws.send(JSON.stringify({event:'ERROR', data:{message:'Unauthorized or invalid token'}}))
            ws.close()
        }

        ws.on('message', async(data)=>{
            const message=JSON.parse(data)
            if(message.event==='ATTENDANCE_MARKED'){
                if(ws.user.role!=='teacher'){
                    ws.send(JSON.stringify({event:'ERROR', data:{message:'Forbidden, teacher event only'}}))
                    return
                }

                if(!getSession()){
                    ws.send(JSON.stringify({event:'ERROR', data:{message:'No active attendance session'}}))
                    return
                }
                const session=getSession()
                session.attendance[message.data.studentId] = message.data.status
                setSession(session)
                wss.clients.forEach(client => {
                    client.send(JSON.stringify({event:'ATTENDANCE_MARKED', data: message.data}))
                })
            }
            if(message.event==='TODAY_SUMMARY'){
                if(ws.user.role!=='teacher'){
                    ws.send(JSON.stringify({event:'ERROR', data:{message:'Forbidden, teacher event only'}}))
                    return
                }
                if(!getSession()){
                    ws.send(JSON.stringify({event:'ERROR', data:{message:'No active attendance session'}}))
                    return
                }
                const session=getSession()
                const values=Object.values(session.attendance)
                const present=values.filter(s=> s==='present').length
                const absent=values.filter(s=>s==='absent').length
                const total=values.length
                wss.clients.forEach(client=>{
                    client.send(JSON.stringify({event:'TODAY_SUMMARY', data:{present:present, absent:absent, total:total}}))
                })
            }

            if(message.event==='MY_ATTENDANCE'){
                if(ws.user.role!=='student'){
                    ws.send(JSON.stringify({event:'ERROR', data:{message:'Forbidden, student event only'}}))
                    return
                }
                if(!getSession()){
                    ws.send(JSON.stringify({event:"ERROR", data:{message:"No active attendance session"}}))
                    return
                }
                const session=getSession()
                const validAttendance=session.attendance[ws.user.userId]
                if(!validAttendance){
                    ws.send(JSON.stringify({event:"MY_ATTENDANCE", data:{status:"not yet updated"}}))
                    return
                }
                ws.send(JSON.stringify({event:"MY_ATTENDANCE", data:{status:validAttendance}}))
            }

            if(message.event==="DONE"){
                if(ws.user.role!=='teacher'){
                    ws.send(JSON.stringify({event: "ERROR", data: {message: "Forbidden, teacher event only"}}))
                    return
                }
                if(!getSession()){
                    ws.send(JSON.stringify({event:'ERROR', data:{message:'No active attendance session'}}))
                    return
                }
                const session = getSession()
                const existingClass=await Class.findById(session.classId)
                const studentIds= existingClass.studentIds.map((id)=>id.toString())

                studentIds.forEach((studentId)=>{
                    if(!session.attendance[studentId]){
                        session.attendance[studentId]='absent'
                    }
                })
                setSession(session)

                const attendanceRecords= studentIds.map((studentId)=>({
                    classId: session.classId,
                    studentId: studentId,
                    status: session.attendance[studentId]
                }))

                await Attendance.insertMany(attendanceRecords)
                const values = Object.values(session.attendance)
                const present = values.filter(s => s === 'present').length
                const absent = values.filter(s => s === 'absent').length
                const total = values.length

                setSession(null)

                wss.clients.forEach(client => {
                    client.send(JSON.stringify({event:'DONE', data:{message:'Attendance persisted', present, absent, total}}))
                })
            }
            
        })
    })

}

module.exports=setupWebSocket