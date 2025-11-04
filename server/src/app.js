const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = 5050;

app.use(cors({
    origin: 'https://localhost:3000',
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}))

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("API is running");
})

app.listen(port,()=>{
    console.log(`App listening on port ${port}`)
})