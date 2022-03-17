const Product = require("../model/Product");
const uuid = require("uuid").v4;
const cloudinary = require("cloudinary");
const Category = require("../model/Category");
const ObjectId = require("mongoose").Types.ObjectId;

exports.addProduct = async( request, response )=>{

    if( !request.files ){
        response.status( 400 ).json({
            success: false,
            message: "Product photo is required to add a product !!"
        });
    } else{
        const productPhotosReq = request.files.productPhotos;
        const productPhotos = [];

        if( productPhotosReq.length === undefined ){
            const result = await cloudinary.v2.uploader.upload( productPhotosReq.tempFilePath, {
                folder: "product_images",
                width: 150,
                crop: "scale"
            });
            
            await productPhotos.push({
                photoId: result.public_id,
                securedURL: result.secure_url
            });
        } else {
            for( let photo of productPhotosReq ){
                const result = await cloudinary.v2.uploader.upload( photo.tempFilePath, {
                    folder: "product_images",
                    width: 150,
                    crop: "scale"
                });

                await productPhotos.push({
                    photoId: result.public_id,
                    securedURL: result.secure_url
                });
            }
        }
        const { productName, productDescription, categoryId } = request.body;

        const productId = uuid();

        await Category.findOne({ _id: categoryId })
        .then(( category )=>{

            category["products"].push({
                productId,
                productName,
                productDescription,
                productPhotos,
            });

            category.save();

            response.status( 200 ).json({
                success: true,
                message: "Product Added succesfully !!",
                category
            });
        })
        .catch(( error )=>{
            response.status( 402 ).json({
                success: false,
                message: "Invalid category !! Please add valid category to add product !!",
                error
            });
        })
    }
};

exports.getAllProductsFromAllCategories = async( request, response )=>{
    await Category.find()
    .then(( categories )=>{
        let products = new Array();

        // Think of Optimization...............
        for( let category of categories ){
            console.log( category.products );

            for( let product of category.products ){
                products.push( product );
            }
            
        }

        response.status( 200 ).json({
            success: true,
            products
        });
    })
    .catch(( error )=>{
        response.status( 401 ).json({
            success: false,
            message: "Error while loading categories !!"
        });

    });
};

exports.getProductsFromCategory = async( request, response )=>{
    const categoryId = request.query.categoryId;

    if( categoryId ){

        await Category.findOne({ categoryId })
        .then(( category )=>{
            const products = category.products;

            response.status( 200 ).json({
                success: true,
                products    
            });
        })
        .catch(( error )=>{
            response.status( 402 ).json({
                success: false,
                message: "Error while loading products...",
                error,
            });
        });
    } else{
        response.status( 402 ).json({
            success: false,
            message: "Please provide category-id to get the products...",
            error,
        });
    }
};

exports.getProductOfACategoryById = async( request, response )=>{
    const categoryId = request.query.categoryId;
    const productId = request.query.productId;

    if( categoryId && productId ){
        await Category.findOne({ categoryId })
        .then(( category )=>{
            for( let product of category.products ){
                if( product.productId === productId ){
                    return response.status( 200 ).json({
                        success: true,
                        product
                    });
                }
            }

            response.status( 400 ).json({
                success: false,
                message: "Product not found !! Please provide valid product-id !!"
            });
        })
        .catch(( error )=>{
            response.status( 400 ).json({
                success: false,
                message: "Category not found !! Please provide valid category-id !!"
            });
        });
    } else{
        response.status( 400 ).json({
            success: false,
            message: "Product-id or categor-id is missing !!",
        });
    }
};

exports.updateProduct = async( request, response )=>{
    const productId = request.params.id;
    const { productName, productDescription, productStatus } = request.body;

    await Product.findOne({ productId })
    .then(( product )=>{
        product.productName = productName;
        product.productDescription = productDescription;
        product.productStatus = productStatus;
        product.productUpdatedAt = Date.now();

        // await product.save();
        product.save();

        response.status( 200 ).json({
            success: true,
            product
        });
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            success: false,
            error
        });
    });
};

exports.deleteProduct = async( request, response )=>{
    const productId = request.params.id;

    if( productId ){
        await Product.deleteOne({ productId })
        .then(( product )=>{
            response.status( 200 ).json({
                success: true,
                product
            });
        })
        .catch(( error )=>{
            response.status( 402 ).json({
                success: false,
                error
            })
        });
    } else{
        response.status( 401 ).json({
            success: false,
            message: "Please provide product-id to delete the product !!"
        })
    }
};

