const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5050;

const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')

app.use(cors({
    origin: 'https://localhost:3000',
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}))

app.use(express.json());


app.get('/',(req,res)=>{
    res.send("API is running");
})

app.use('/users',userRoute);
app.use('/auth',authRoute);

app.listen(port,()=>{
    console.log(`App listening on port ${port}`)
})