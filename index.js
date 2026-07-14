require('dotenv').config()
const connectDB= require('./config/db')

const express= require('express')
const http=require('http')
const authRoutes=require('./routes/auth')
const classRoutes=require('./routes/class')
const attendanceRoutes=require('./routes/attendance')
const setupWebSocket = require('./websocket/index')
const app=express()
const server=http.createServer(app)

connectDB()

app.use(express.json())

app.get('/', (req, res)=>{
    res.json({success: true, message: "Server is running"})
})

app.get('/test', (req,res)=>{
    res.send("This is a test")
})

app.use('/auth', authRoutes)
app.use('/class', classRoutes)
app.use('/attendance', attendanceRoutes)

server.listen(3000, ()=>{
    console.log('Server running on port 3000')
})

setupWebSocket(server)