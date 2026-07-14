

const express=require('express')
const router= express.Router()
const authMiddleware= require('../middleware/auth')
const roleMiddleware= require('../middleware/role')
const User= require('../models/User')
const Attendance= require('../models/Attendance')
const Class=require('../models/Class')
const {z}=require('zod')
const {getSession, setSession}= require('../websocket/session')

const classSchema=z.object({
    classId:z.string()
})

router.post('/start', authMiddleware, roleMiddleware('teacher'), async(req,res)=>{
    const result= classSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({success:false, error:'Invalid request schema'})
    }
    const existingClass= await Class.findById(result.data.classId)
    if(!existingClass){
        return res.status(404).json({success:false, error:'Class not found'})
    }
    const teacher= req.user.userId
    if(teacher!==existingClass.teacherId.toString()){
        return res.status(403).json({success:false, error:'Forbidden, not class teacher'})
    }
    setSession({
        classId:req.body.classId,
        startedAt: new Date().toISOString(),
        attendance:{}
    })
    return res.status(200).json({success:true, data:{classId: getSession().classId, startedAt: getSession().startedAt}})
})

module.exports=router