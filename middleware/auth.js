const jwt= require('jsonwebtoken')

const authMiddleware= (req, res, next)=>{
    const token= req.headers['authorization']
    if(!token){
        return res.status(401).json({success:false, error:'Unauthorized, missing or invalid token'})
    }

    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        req.user=decoded
        next()
    } catch(err){
        return res.status(401).json({success:false, error:'Unauthorized, missing or invalid token'})
    }
}

module.exports=authMiddleware