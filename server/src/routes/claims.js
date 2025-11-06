const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// POST-> CREATING A CLAIM (AUTHENTICATED USER ONLY)

router.post('/:id/claim',verifyToken,async(req,res)=>{
    try{
        const {id} = req.params;
        const {id: user_id} = req.user; // Comes from jwt
        

        const Listingresult = await pool.query(
            "SELECT * FROM food_listings WHERE id = $1 AND status = $2",
            [id,"available"]
        );
        if(Listingresult.rows.length === 0){
            return res.status(404).json({ error: 'Listing not available for claiming' });
        }

        // Creating a claim record

        const result = await pool.query(
            `Insert INTO claims(listing_id, claimed_by)
            VALUES ($1, $2)
            RETURNING *`,
            [id, user_id]
        );

        //Updating the listing status to claimed

        await pool.query("UPDATE food_listings SET status = $1 WHERE id = $2",["claimed",id]);
        res.status(201).json(result.rows[0])
    }catch(err){
        console.error('Error claiming listing:', err.message);
    res.status(500).json({ error: 'Internal server error' });
    }
}
);

// GET => Get all claims of the authenticated user
router.get('/user', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;

    const result = await pool.query(
      `SELECT cl.*, fl.title, fl.description, fl.status
       FROM claims cl
       JOIN food_listings fl ON cl.listing_id = fl.id
       WHERE cl.claimed_by = $1`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching claims:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH -> Update claim status (e.g., from claimed to completed)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;
    const { status } = req.body; // 'completed' or any other status

    // Validate that the claim belongs to the user
    const claimResult = await pool.query(
      'SELECT * FROM claims WHERE id = $1 AND claimed_by = $2',
      [id, user_id]
    );

    if (claimResult.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found or not owned by you' });
    }

    // Update the claim status
    const updatedResult = await pool.query(
      'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(updatedResult.rows[0]);
  } catch (err) {
    console.error('Error updating claim status:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;