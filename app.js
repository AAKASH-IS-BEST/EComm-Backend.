const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const productRoutes = require("./routes/ProductRoutes");

const app = express();

app.use( express.json() );
app.use( express.urlencoded({ extended: true }));
app.use( cookieParser() );
app.use( cors() );

app.use("/api/v1", productRoutes );

app.get("/", ( request, response )=>{
    response.send("Namaste !!");
});

mongoose.connect("mongodb://localhost:27017/ecomm").then(()=>{ console.log("DB Connected sucesfuly"); }).catch(( error )=>{ console.log("Error: "+ error ) });

const PORT = 4000;

app.listen( PORT, ()=>{
    console.log(`App is running on port ${PORT}...`);
});