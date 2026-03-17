const express=require('express')
const router= express.Router()
const bcrypt=require('bcrypt')
const jwt= require('jsonwebtoken')
const User= require('../models/User')
const {z}=require('zod')

const signupSchema=z.object({
    name:z.string(),
    email:z.string().email(),
    password:z.string().min(6),
    role:z.enum(['teacher','student'])
})

router.post('/signup', async(req,res)=>{
    const result= signupSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({success:false, error:'invalid request schema'})
    }
    const {name, email, password, role}=result.data
    const existinguser= await User.findOne({email})
    if(existinguser){
        return res.status(400).json({success:false, error:'email already exists'})
    }
    const hashedPassword= await bcrypt.hash(password,10)
    const user= await User.create({name, email, password:hashedPassword, role})
    res.status(201).json({success:true, data:{_id:user._id, name: user.name, email:user.email, role:user.role}})
})


module.exports=router