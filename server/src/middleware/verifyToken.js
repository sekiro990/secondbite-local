const jwt = require('jsonwebtoken')
require('dotenv').config();

function verifyToken(req,res,next){
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({error: 'Token Missing'});

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        console.error("Invalid Token: ",err.message)
        res.status(500).json({err:"Invalid or expired token"});
    }
}

module.exports = verifyToken;