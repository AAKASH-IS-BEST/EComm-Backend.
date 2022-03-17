const express = require("express");
const { getProductOfACategoryById, addProduct, updateProduct, deleteProduct, getProductsFromCategory, getAllProductsFromAllCategories } = require("../controllers/ProductController");

const router = express.Router();

router.route("/products/categories").get( getProductsFromCategory );

router.route("/product/category").get( getProductOfACategoryById );

router.route("/products").get( getAllProductsFromAllCategories );

router.route("/product").post( addProduct );

router.route("/product/:id").put( updateProduct );

router.route("/product/:id").delete( deleteProduct );

module.exports = router;