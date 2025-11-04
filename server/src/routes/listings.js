const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Creating listing

router.post("/",verifyToken,async(req,res)=>{
    try{
        const { title, description, category, quantity, expiry_date, image_url, location_lat, location_lng} = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const result = await pool.query(`
            INSERT INTO food_listings
            (title, description, category, quantity, expiry_date, image_url, location_lat, location_lng, created_by)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [title, description, category, quantity, expiry_date, image_url, location_lat, location_lng, req.user.id]
        );

        res.status(201).json(result.rows[0]);
    }catch(err){
        console.error('Error creating listing:', err.message);
        res.status(500).json({ error:err.message});
    }
});

// Get all listings

router.get('/', async(req,res)=>{
    try{
        const result = await pool.query(`
            SELECT fl.*, u.name AS donor_name
            FROM food_listings fl
            JOIN users u ON fl.created_by = u.id
            ORDER BY fl.created_at DESC
        `);
        
        res.json(result.rows);
    }catch(err){
        console.error('Error fetching listings:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;