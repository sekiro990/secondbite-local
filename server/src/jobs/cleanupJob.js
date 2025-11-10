const cron = require("node-cron");
const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

// Runs every hour
cron.schedule("0 * * * *", async() => {
    console("Running cleanup job")

    try{
        // Fetching expired items or those already claimed
        const {rows} = await pool.query(
            `
            SELECT id, cloudinary_public_id
            FROM food_listings
            WHERE (expiry_date < NOW())
                OR(claimed_at IS NOT NULL AND claimed_at < NOW() - INTERVAL '4 hours')
            `
        )
        if(rows.length === 0){
            console.log("No expired or old claimed listings to delete.");
      return;
        }

    for(const item of rows){
        try{
            // Deleting image now from cloudinary
            if(item.cloudinary_public_id){
                await cloudinary.uploader.destroy(item.cloudinary_public_id);
                console.log(`Cloudinary image deleted for listing ${item.id}`);
            }

            await pool.query("DELETE id FROM food_listings WHERE id = $1",[item.id]);
            console.log(`Listing ${item.id} removed from DB`);
        }catch(err){
            console.error(`Failed to delete listing ${item.id}:`, err.message);
        }
    }
    }catch(err){
        console.error("Cleanup job failed:", err.message);
    }
})

