const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

// Creating listing

router.post("/", verifyToken, upload.single('photo'), async (req, res) => {
    let photo;
    try {
        const { title, description, category, quantity, expiry_date, location_lat, location_lng } = req.body;
        const created_by = req.user.id;

        if (!title || !category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        let image_url = null;
        if (req.file) {
            photo = await cloudinary.uploader.upload(req.file.path, {
                folder: 'secondbite_local',
            })
            image_url = photo.secure_url;
        };
        const result = await pool.query(`
            INSERT INTO food_listings
            (title, description, category, quantity, expiry_date, image_url, location_lat, location_lng, created_by, cloudinary_public_id)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [title, description, category, quantity, expiry_date, image_url, location_lat, location_lng, req.user.id, photo.public_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating listing:', err.message);

        if (photo?.public_id) {
            await cloudinary.uploader.destroy(photo.public_id);
            console.log('Rolled back Cloudinary upload:', photo.public_id);
        }
        res.status(500).json({ error: err.message });
    }
});

// Get all listings

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT fl.*, u.name AS donor_name
            FROM food_listings fl
            JOIN users u ON fl.created_by = u.id
            ORDER BY fl.created_at DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching listings:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User can delete his listing

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Checking if the listing exists
        const { rows } = await pool.query("SELECT * FROM food_listings WHERE id = $1", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Listing not found" });
        }
        const listing = rows[0];

        // lets verify ownership
        if (listing.created_by !== userId) {
            return res.status(403).json({ error: "You can only delete your own listings" });
        }
        // Delete cloudinary image if present
        if (listing.cloudinary.public_id) {
            try {
                await cloudinary.uploader.destroy(listing.cloudinary_public_id);
                console.log(`Deleted Cloudinary image for listing ${id}`);
            } catch (cloudErr) {
                console.warn(`Cloudinary deletion failed for listing ${id}:`, cloudErr.message);
            }
        }

        // Delete from db
        await pool.query(`DELETE FROM food_listings WHERE id = $1`, [id]);
        res.json({ message: "Listing deleted successfully" });
    }

    catch (err) {
        console.error("Error deleting listing:", err.message);
        res.status(500).json({ error: err.message });
    }
}
)

module.exports = router;