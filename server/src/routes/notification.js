const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Creating a notification and adding in a table

router.post('/', verifyToken, async(req,res) => {
    try {

        const {user_id,message} = req.body;

        if(!user_id || !message){
            return res.status(400).json({ error: 'user_id and message are required' });
        }
        
        const result = await pool.query(`
                INSERT INTO notifications (user_id, message)
                VALUES($1, $2)
                RETURNING *`,[user_id,message]
            )
        
        res.status(201).json({
            message:'Notification created successfully',
            notification: result.rows[0],
        }
        )

    } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).json({ error: 'Internal server error' });
    }
})

// Get all notificatiomn for logged inm user

router.get('/', verifyToken, async(req,res) => {
    try {
        const {id: userId} = req.user;
        const result = await pool.query(
            `
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,[userId]
        )
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching notifications:', err.message)
        res.status(500).json({error: 'Internal server error'})
    }
})

// Marking a notification as read

router.put('/:id/read', verifyToken, async(req,res) => {
    try {
        const {id} = req.params
        const {id: userId} = req.user
        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1 AND user_id = $2
            RETURNING *
            `,[id,userId]
        )
        if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or not owned by user' });
    }
    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0],
    });
    } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).json({ error: 'Internal server error' });
    }
})
module.exports = router;