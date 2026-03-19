const express=require('express')
const router= express.Router()
const bcrypt=require('bcrypt')
const jwt= require('jsonwebtoken')
const User= require('../models/User')
const {z, success}=require('zod')

const signupSchema=z.object({
    name:z.string(),
    email:z.string().email(),
    password:z.string().min(6),
    role:z.enum(['teacher','student'])
})

const loginSchema=z.object({
    email: z.string().email(),
    password:z.string().min(6)
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

router.post('/login', async(req,res)=>{
    const result= loginSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({success:false, error:'invalid request schema'})
    }
    const {email, password}=result.data
    const existinguser=await User.findOne({email})
    if(!existinguser){
        return res.status(400).json({success:false, error:'invalid email or password'})
    }

    const validpassword= await bcrypt.compare(password, existinguser.password)
    if(!validpassword){
        return res.status(400).json({success:false, error:'invalid email or password'})
    }

    const token=jwt.sign(
        {userId: existinguser._id, role: existinguser.role},
        process.env.JWT_SECRET
    )
    return res.status(200).json({success:true, data:{token}})
})


module.exports=router