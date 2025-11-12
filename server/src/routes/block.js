const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

//  Block a user
router.post("/", verifyToken, async (req, res) => {
  try {
    const { blocked_id } = req.body;
    const blocker_id = req.user.id;

    if (!blocked_id) return res.status(400).json({ error: "blocked_id required" });
    if (blocked_id === blocker_id) return res.status(400).json({ error: "You cannot block yourself" });

    const existing = await pool.query(
      `SELECT * FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
      [blocker_id, blocked_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already blocked" });
    }

    await pool.query(
      `INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2)`,
      [blocker_id, blocked_id]
    );

    res.status(201).json({ message: "User blocked successfully" });
  } catch (err) {
    console.error("Error blocking user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

//  Unblock user
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // blocked_id
    const blocker_id = req.user.id;

    await pool.query(
      `DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
      [blocker_id, id]
    );

    res.json({ message: "User unblocked successfully" });
  } catch (err) {
    console.error("Error unblocking user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
