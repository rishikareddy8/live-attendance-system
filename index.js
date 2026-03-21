require('dotenv').config()
const connectDB= require('./config/db')

const express= require('express')
const authRoutes=require('./routes/auth')
const classRoutes=require('./routes/class')
const app=express()

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

app.listen(3000, ()=>{
    console.log('Server running on port 3000')
})