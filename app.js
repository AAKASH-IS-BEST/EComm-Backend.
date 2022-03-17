require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

const productRoutes = require("./routes/ProductRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");

// Cloudinary Configuration...
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const app = express();

app.use( express.json() );
app.use( express.urlencoded({ extended: true }));
app.use( cookieParser() );
app.use( cors() );
app.use( fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

app.use("/api/v1", productRoutes );
app.use("/api/v1", categoryRoutes );

app.get("/", ( request, response )=>{
    response.send("Namaste !!");
});

mongoose.connect("mongodb://localhost:27017/ecomm").then(()=>{ console.log("DB Connected sucesfuly"); }).catch(( error )=>{ console.log("Error: "+ error ) });

const PORT = 4000;

app.listen( PORT, ()=>{
    console.log(`App is running on port ${PORT}...`);
});