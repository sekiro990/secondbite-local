const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

// Posting a review

router.post("/", verifyToken, async (req, res) => {
    try {

        const { listing_id, rating, comment } = req.body;
        const reviewer_id = req.user.id;

        if (!listing_id || !rating) {
            return res.status(400).json({ error: "Listing ID and rating are required" });
        }

        const result = await pool.query(
            `
        INSERT INTO reviews (reviewer_id, listing_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [reviewer_id, listing_id, rating, comment]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("Error adding review:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET ALL Reviews

router.get("/:listingId", async (req, res) => {
    try {
        const {listingId} = req.params;
        const result = await pool.query(
            `
            SELECT r.*, u.name AS reviewer_name
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            WHERE r.listing_id = $1
            ORDER BY r.created_at DESC
            `, [listingId]
        )
        res.json(result.rows)
    } catch (err) {
        console.error("Error fetching reviews:", err.message);
        res.status(500).json({ error: err.message });
    }
})
// Delete a review (only by the user who created it)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to the user
    const { rows } = await pool.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const review = rows[0];
    if (review.reviewer_id !== userId) {
      return res.status(403).json({ error: "You can only delete your own review" });
    }

    // Delete the review
    await pool.query(`DELETE FROM reviews WHERE id = $1`, [id]);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err.message);
    res.status(500).json({ error: err.message });
  }
});
    // Average ratings
router.get("/average/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const result = await pool.query(
      `SELECT
         COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating,
         COUNT(*) AS total_reviews
       FROM reviews
       WHERE listing_id = $1`,
      [listingId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;