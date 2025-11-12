const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

// Reporting a user
router.post("/", verifyToken, async (req, res) => {
  try {
    const { chat_id, reported_user, reason } = req.body;
    const reported_by = req.user.id;

    if (!chat_id || !reported_user || !reason) {
      return res.status(400).json({ error: "chat_id, reported_user, and reason are required" });
    }

    await pool.query(
      `INSERT INTO reports (reported_by, reported_user, chat_id, reason)
       VALUES ($1, $2, $3, $4)`,
      [reported_by, reported_user, chat_id, reason]
    );

    res.status(201).json({ message: "Report submitted successfully" });

  } catch (err) {
    console.error("Error submitting report:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;