const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productId: {
        type: String,
        required: [ true, "Please provide a Product-id !!"],
        maxlength: [ 40, "Product-id should be under 40 characters !!"],
        minlength: [ 3, "Product-id should be of atleast 3 character !!"],
    },
    categoryId: {
        type: String,
        required: [ true, "Please provide category id associated with product..."]
    },
    productName: {
        type: String,
        required: [ true, "Please provide a Product-name !!"],
        maxlength: [ 40, "Product-name should be under 40 characters !!"],
        minlength: [ 3, "Product-name should be of atleast 3 character !!"],
    },
    productDescription: {
        type: String,
        required: [ true, "Please provide a Product-description !!"],
        maxlength: [ 500, "Product-description should be under 40 characters !!"],
        minlength: [ 3, "Product-description should be of atleast 3 character !!"],
    },
    productPrice: {
        type: Number,
        required: [ true, "Please provide price of product !!"],
        min: 1,
        max: 10000000
    },
    productPhotos: [
        {
            photoId: {
                type: String,
                required: true,
            },
            securedURL: {
                type: String,
                required: true,
            },
        }
    ],
    productStatus: {
        type: String,
        enum: [ "Active", "Inactive" ],
        default: "Active",
    },
    productStartedAt: {
        type: Date,
        default: Date.now,
    },
    productEndAt: {
        type: Date,
    },
    productCreatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    productUpdatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

module.exports = mongoose.model( "Product", productSchema );