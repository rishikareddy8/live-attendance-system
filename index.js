const express= require('express')
const app=express()

app.use(express.json())

app.get('/', (req, res)=>{
    res.json({success: true, message: "Server is running"})
})

app.get('/test', (req,res)=>{
    res.send("This is a test")
})

app.listen(3000, ()=>{
    console.log('Server running on port 3000')
})