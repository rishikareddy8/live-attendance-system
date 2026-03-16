const express= require('express')
const app=express()

app.get('/', (req, res)=>{
    res.send("Hiii")
})

app.get('/test', (req,res)=>{
    res.send("This is a test")
})

app.listen(3000, ()=>{
    console.log('Server running on port 3000')
})