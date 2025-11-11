const express = require('express');
const cors = require('cors');
require('dotenv').config();
require("../src/jobs/cleanupJob");
const app = express();
const port = 5050;

const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const listingRoute = require('./routes/listings')
const claimsRoute = require('./routes/claims')
const notificationRoute = require('./routes/notification')
const reviewRoute = require('./routes/review')

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}))

app.use(express.json());


app.get('/',(req,res)=>{
    res.send("API is running");
})

app.use('/users',userRoute);
app.use('/auth',authRoute);
app.use('/listings',listingRoute);
app.use('/claims',claimsRoute);
app.use('/notifications', notificationRoute);
app.use('/reviews', reviewRoute);
app.listen(port,()=>{
    console.log(`App listening on port ${port}`)
})