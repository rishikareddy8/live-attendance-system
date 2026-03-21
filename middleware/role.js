const roleMiddleware=(role)=>{
    return (req,res,next)=>{
        if(req.user.role!==role){
            return res.status(403).json({success:false, error:'forbidden, teacher access required'})
        }
        next()
    }
}

module.exports= roleMiddleware