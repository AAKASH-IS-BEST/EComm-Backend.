const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productId: {
        type: String,
        required: [ true, "Please provide a Product-id !!"],
        maxlength: [ 40, "Product-id should be under 40 characters !!"],
        minlength: [ 3, "Product-id should be of atleast 3 character !!"],
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