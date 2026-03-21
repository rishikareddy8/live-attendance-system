const mongoose= require('mongoose')

const attendanceSchema= new mongoose.Schema({
    classId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Class'
    },
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:['present', 'absent'],
        required:true
    }
})

const Attendance= mongoose.model('Attendance', attendanceSchema)

module.exports=Attendance