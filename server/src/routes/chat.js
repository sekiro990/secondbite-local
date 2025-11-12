const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

// creating chat between two users

router.post("/", verifyToken, async (req, res) => {
    try {
        const { listing_id, receiver_id } = req.body;
        const sender_id = req.user.id;

        // Prevent self chat
        if (sender_id === receiver_id) {
            return res.status(400).json({ error: "You can't chat with yourself." });
        }
        // Check if chat exists already
        const existing = await pool.query(
            `
        SELECT * FROM chats
        WHERE (user1_id = $1 AND user2_id = $2)
        OR (user1_id = $2 AND user2_id = $1)
         AND listing_id = $3`,
            [sender_id, receiver_id, listing_id]
        )
        if (existing.rows.length > 0) {

            return res.json(existing.rows[0]);
        }

        // Create new chat

        const result = await pool.query(
            `
        INSERT INTO chats (listing_id, user1_id, user2_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `, [listing_id, sender_id, receiver_id]
        )

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating chat:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET all chats for the current user

router.get("/", verifyToken, async(req, res)=> {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT * FROM chats
            WHERE user1_id = $1 OR user2_id = $1
            ORDER BY started_at DESC
            `,[userId])
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching chats:", err.message);
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;