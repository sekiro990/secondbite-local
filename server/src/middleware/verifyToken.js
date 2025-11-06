const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer"
    if (!token) return res.status(401).json({ error: 'Token Missing' });

    try {
        // Decode the token and store the payload in req.user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded JWT payload to req.user
        next();  // Continue to the next middleware or route handler
    } catch (err) {
        console.error("Invalid Token:", err.message);
        res.status(500).json({ error: "Invalid or expired token" });
    }
}

module.exports = verifyToken;
