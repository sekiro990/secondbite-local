const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
require('dotenv').config();
const verify = require('../middleware/verifyToken')

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

// Post Method -> Creating new users

router.post('/',verify, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, role, created_at;
        `;

        const values = [name, email, password];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: err.message });
    }
})

// GET -> fetch all users

router.get('/',async(req,res)=>{
    try{
        const result = await pool.query('SELECT id, name, email, password, role, created_at FROM users;');
        res.json(result.rows);
    }catch(err){
        console.error('Error fetching users:', err.message);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports = router;

