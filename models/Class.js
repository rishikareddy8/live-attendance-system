const mongoose= require('mongoose')

const classSchema= new mongoose.Schema({
    className:{
        type:String,
        required: true
    },
    teacherId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    studentIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Class=mongoose.model('Class', classSchema)

module.exports=Class