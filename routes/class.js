const express= require('express')
const router= express.Router()
const authMiddleware= require('../middleware/auth')
const roleMiddleware= require('../middleware/role')
const User= require('../models/User')
const Class= require('../models/Class')
const {z}= require('zod')

const classSchema=z.object({
    className:z.string()
})
const studentSchema=z.object({
    studentId:z.string()
})

router.post('/', authMiddleware, roleMiddleware('teacher'), async(req, res)=>{
    const result= classSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({success:false, error:'Invalid request schema'})
    }
    const className=result.data.className
    const teacherId= req.user.userId
    const newClass=await Class.create({className, teacherId})
    return res.status(201).json({success:true, data:{_id:newClass._id, className:newClass.className, teacherId:newClass.teacherId, studentIds:newClass.studentIds}})

})

router.post('/:id/add-student', authMiddleware, roleMiddleware('teacher'), async(req,res)=>{
    const result=studentSchema.safeParse(req.body)
    if(!result.success){
        return res.status(400).json({success:false, error:'Invalid request schema'})
    }
    const existingclass= await Class.findById(req.params.id)
    if(!existingclass){
        return res.status(404).json({success:false, error:'Class not found'})
    }
    const teacherId=existingclass.teacherId
    if(teacherId.toString()!==req.user.userId){
        return res.status(403).json({success:false, error:'Forbidden, not class teacher'})
    }
    const studentId=result.data.studentId
    const student= await User.findById(studentId)
    if(!student){
        return res.status(404).json({success:false, error:'Student not found'})
    }
    existingclass.studentIds.push(studentId)
    await existingclass.save()
    return res.status(201).json({success:true, data:{_id:existingclass._id, className:existingclass.className, teacherId:existingclass.teacherId, studentIds:existingclass.studentIds}})
})

router.get('/students', authMiddleware, async(req,res)=>{
    const role=req.user.role
    if(role!=='teacher'){
        return res.status(403).json({success:false, error:'Forbidden, teacher access required'})
    }
    const students= await User.find({role:'student'},'name email')
    res.status(200).json({success:true, data:{students}})
})

router.get('/:id', authMiddleware, async(req,res)=>{
    const classId=req.params.id
    const existingclass= await Class.findById(classId).populate('studentIds','name email')
    if(!existingclass){
        return res.status(404).json({success:false, error:'Class not found'})
    }
    if(req.user.role=='teacher'){
        if(!(req.user.userId === existingclass.teacherId.toString())){
            return res.status(403).json({success:false, error:'Forbidden, not class teacher'})
        }
    }
    else{
        const student=req.user.userId
        if(!existingclass.studentIds.some(id=> id.toString()===student)){
            return res.status(404).json({success:false, error:'Student not found'})
        }
    }

    return res.status(200).json({success:true, data:{_id:existingclass._id, className:existingclass.className, teacherId:existingclass.teacherId, studentIds:existingclass.studentIds}})
})


module.exports=router