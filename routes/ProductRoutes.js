const express = require("express");
const { getProducts, getProductById, addProduct, updateProduct, deleteProduct } = require("../controllers/ProductController");

const router = express.Router();

router.route("/products").get( getProducts );

router.route("/product/:id").get( getProductById );

router.route("/product").post( addProduct );

router.route("/product/:id").put( updateProduct );

router.route("/product/:id").delete( deleteProduct );

module.exports = router;