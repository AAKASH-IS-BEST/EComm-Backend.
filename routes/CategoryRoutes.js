const express = require("express");
const { check } = require("express-validator");
const { getCategories, getCategory, addCategory, updateCategory, deleteCategory, inactiveCategory, getProductsOfACategory, getAllParentCategories, getChildCategoriesOfACategory, addImageToACategory, deleteImageFromACategory } = require("../controllers/CategoryController");


const router = express.Router();

router.route("/categories").get( getCategories );

router.route("/category/:id").get( getCategory );

router.route("/category/products/:categoryId").get( getProductsOfACategory );

router.route("/parent/category").get( getAllParentCategories );

router.route("/category/childs/:categoryId").get( getChildCategoriesOfACategory );

router.route("/category").post( [
    check("categoryName").isLength({ min:3, max: 40 }).withMessage("Category-Name length must be between 3 to 40 chars only !!"),
    check("categoryDescription").isLength({ min:3, max: 500 }).withMessage("Category-Description length must be between 3 to 500 chars only !!"),
], addCategory );

router.route("/category/status/:categoryId").patch( inactiveCategory );

router.route("/category/:id").put([
    check("categoryName").isLength({ min:3, max: 40 }).withMessage("Category-Name length must be between 3 to 40 chars only !!"),
    check("categoryDescription").isLength({ min:3, max: 500 }).withMessage("Category-Description length must be between 3 to 500 chars only !!"),
    check("categoryStatus").notEmpty().withMessage("Please provide category-status !!"),
], updateCategory );

router.route("/category/add/image/:categoryId").put( addImageToACategory );

router.route("/category/:id").delete( deleteCategory );

router.route("/category/delete/image/:categoryId").delete( deleteImageFromACategory );

module.exports = router;