    const {Pool} = require('pg');
    require('dotenv').config();

    const pool = new Pool({
        connectionString: process.env.DB_URL,
        ssl: {rejectUnauthorized: false}
    })

    pool.connect()
    .then(()=>{console.log("connection successful")})
    .catch(err=>{
        console.error("connection not successful:");
        console.error("Error code:", err.code);
        console.error("Message:", err.message);
    })
    .finally(() => pool.end());