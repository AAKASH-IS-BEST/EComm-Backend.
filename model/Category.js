const mongoose = require("mongoose");
const Product = require("./Product");

const categorySchema = mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
    },
    categoryName: {
        type: String,
        required: [ true, "Please provide category-name !!"],
        minlength: [ 3, "Category-Name length should be atleast 3 chars !!"],
        maxlength: [ 40, "Category-Name length should not be more than 40 chars !!"],
    },
    categoryPhotos: [
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
    categoryDescription: {
        type: String,
        minlength: [ 3, "Category Description should be atleast 3 chars !!"],
        maxlength: [ 500, "Category Description length should not be more than 500 chars !!"]
    },
    categoryStatus: {
        type: String,
        enum: [ "Active", "Inactive" ],
        default: "Active",
    },
    products: [ Product.schema ],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "Category"
    },
    categoryCreatedAt: {
        type: Date,
        default: Date.now,
    },
    categoryUpdatedAt: {
        type: Date,
        default: Date.now,
    },
}); 

module.exports = mongoose.model( "Category", categorySchema );