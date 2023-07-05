require("dotenv").config();
const express = require("express");
const app=express();
require('./db/conn');
const cors = require('cors');
const PORT=process.env.PORT || 6010;
const router = require("./Routes/router")

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("./uploads"));
app.use("/files",express.static("./public/files"));
app.use(router);

app.listen(PORT,()=>{
    console.log(`server start at ${PORT}`)
})