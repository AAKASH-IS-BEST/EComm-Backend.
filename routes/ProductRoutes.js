const express = require("express");
const { getProductOfACategoryById, addProduct, updateProduct, deleteProduct, getProductsFromCategory, getAllProductsFromAllCategories } = require("../controllers/ProductController");

const router = express.Router();

router.route("/products/categories").get( getProductsFromCategory );

router.route("/product/category").get( getProductOfACategoryById );

router.route("/products").get( getAllProductsFromAllCategories );

router.route("/product").post( addProduct );

router.route("/product/:categoryId/:productId").put( updateProduct );

router.route("/product/add-image/:productId").put(  );

router.route("/product/delete-image/:productId").delete(  );

router.route("/product/:categoryId/:productId").delete( deleteProduct );

module.exports = router;