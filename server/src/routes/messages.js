const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

// Send a message
router.post("/", verifyToken, async (req, res) => {
    try {
        const { chat_id, message } = req.body;
        const sender_id = req.user.id;

        if (!chat_id || !message) {
            return res.status(400).json({ error: "chat_id and message are required" });
        }

        // Checking if chat exists
        const chat = await pool.query("SELECT * FROM chats WHERE id = $1", [chat_id]);
        if (chat.rows.length === 0) {
            return res.status(404).json({ error: "Chat not found" });
        }

        // Checking if sender is part of the chat
        const participants = chat.rows[0];
        if (participants.user1_id !== sender_id && participants.user2_id !== sender_id) {
            return res.status(403).json({ error: "You are not part of this chat" });
        }
         const result = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [chat_id, sender_id, message]
    );
        res.json(result.rows[0])
    } catch (err) {
        console.error("Error fetching messages:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Deleting a message from sender side only
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const msg = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
        if (msg.rows.length === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        const message = msg.rows[0];
        if (message.sender_id !== userId) {
            return res.status(403).json({ error: "You can only delete your own messages" });
        }

        await pool.query("UPDATE messages SET is_deleted = true WHERE id = $1", [id]);
        res.json({ message: "Message deleted" });
    } catch (err) {
        console.error("Error deleting message:", err.message);
        res.status(500).json({ error: err.message });
    }
})

// Marking message as seen
router.put("/seen/:chatId", verifyToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        await pool.query(`
            UPDATE messages
            SET seen = TRUE
            WHERE chat_id = $1 AND sender_id != $2
            `, [chatId, userId])
        res.json({ message: "Messages marked as seen" });
    } catch (err) {
        console.error("Error marking messages seen:", err.message);
        res.status(500).json({ error: err.message });
    }
})

// Fetching messages for a particular user
router.get("/:chatId", verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify user belongs to chat
    const chat = await pool.query(`SELECT * FROM chats WHERE id = $1`, [chatId]);
    if (chat.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const participants = chat.rows[0];
    if (participants.user1_id !== userId && participants.user2_id !== userId) {
      return res.status(403).json({ error: "You are not part of this chat" });
    }

    const result = await pool.query(
      `SELECT * FROM messages
       WHERE chat_id = $1
       ORDER BY created_at ASC`,
      [chatId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;