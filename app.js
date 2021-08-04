require('dotenv').config();
const express = require('express');
const route=require('./api/user/router/router');
const bp = require('body-parser');
const cors = require('cors');
const app=express();
app.use(cors());
app.use(bp.json());
app.use("/",route)
app.listen(process.env.APP_PORT,()=>{
    console.log('Running on 3000');
})