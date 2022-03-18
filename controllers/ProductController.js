const Product = require("../model/Product");
const uuid = require("uuid").v4;
const cloudinary = require("cloudinary");
const Category = require("../model/Category");


const uploadImageToCloud = async( image, path )=>{
    const result = await cloudinary.v2.uploader.upload( image, {
        folder: path,
        width: 150,
        crop: "scale"
    });

    return result;
};

const deleteImageFromCloud = async( image )=>{
    return await cloudinary.v2.uploader.destroy( image );
}; 

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
    const categoryId = request.params.categoryId;
    const productId = request.params.productId;

    const { productName, productDescription, productStatus, productStartAt, productEndsAt, productCategoryId } = request.body;

    // When category is same like we just have to update the details to existing product...
    if( categoryId === productCategoryId ){
        await Category.findOne({ categoryId })
        .then(( category )=>{
            const products = category.products;
            const productLength = category.products.length;

            for ( let index = 0; index < productLength; index++ ) {
                if( products[index].productId === productId ){
                    const product = products[index];

                    product.productName = productName;
                    product.productDescription = productDescription;
                    product.productStatus = productStatus;
                    product.productStartAt = productStartAt;
                    product.productEndsAt = productEndsAt;
                    product.productUpdatedAt = Date.now();

                    category.save();

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
            response.status( 401 ).json({
                success: false,
                message: "Category not found !! please provide valid category-id !!",
                error
            });
        });
    } else{
    // When category is also change like we have to update the category of product also...
        const category = await Category.findOne({ categoryId });
        const newCategory = await Category.findOne({ productCategoryId });

        if( !category ){
            return response.status( 400 ).json({
                success: false,
                message: "Category Not Found !! Please provide valid category-id !!",
            });
        } else if( !newCategory ){
            return response.status( 400 ).json({
                success: false,
                message: "New Category Not Found !! Please provide valid category-id !!",
            });
        } else{
            // get product from a category
            const products = category.products;
            const productLength = category.products.length;

            for ( let index = 0; index < productLength; index++ ) {
                if( products[index].productId === productId ){
                    const productPhotos = products[index].productPhotos;
                    
                    const product = new Product({
                        productId,
                        productName,
                        productDescription,
                        productPhotos,
                        productStatus,
                        productStartAt,
                        productEndsAt,
                    });

                    category.products.splice( index, 1 );

                    await category.save();

                    newCategory.products.push( product );

                    await newCategory.save();

                    return response.status( 200 ).json({
                        success: true,
                        product,
                        newCategory
                    });
                }
            }

            response.status( 400 ).json({
                success: false,
                message: "Product not found !! Please provide valid product-id !!"
            });
        }
    }
};

exports.deleteProduct = async( request, response )=>{
    const categoryId = request.params.categoryId;
    const productId = request.params.productId;

    if( categoryId && productId ){
        await Category.findOne({ categoryId })
        .then(( category )=>{
            const products = category.products;
            const productsLength = category.products.length;

            for ( let index = 0; index < productsLength; index++ ) {
                if( products[index].productId === productId ){
                    category.products.splice( index, 1 );

                    category.save();

                    return response.status( 200 ).json({
                        success: true,
                        message: "Product deleted sucesfuly !!",
                        category
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
                message: "Category not found !! Please provide valid category-id !!",
                error
            });
        });
    } else{
        response.status( 401 ).json({
            success: false,
            message: "Please provide product-id and category-id to delete the product !!"
        })
    }
};

exports.addImagesToProduct = async( request, response )=>{
    const { categoryId, productId } = request.body;

    if( categoryId && productId ){
        if( request.files ){
            const images = request.files.productImages;

            const category = await Category.findOne({ categoryId });

            if( !category ){
                return response.status( 400 ).json({
                    success: false,
                    message: "Category not found !! Please provide valid category !!",
                });
            }

            if( images.length === undefined ){

                const products = category.products;

                for (const product of products) {
                    if( product.productId === productId ){

                        const result = await uploadImageToCloud( images.tempFilePath, "product_images" );

                        await product.productPhotos.push({
                            photoId: result.public_id,
                            securedURL: result.secure_url,
                        });

                        category.save();

                        return response.status( 200 ).json({
                            success: true,
                            message: "Images added succesfuly !!",
                            product,
                            category,
                        });
                    }

                    return response.status( 400 ).json({
                        success: false,
                        message: "Product not found !! Please provide valid Product !!",
                    });
                }
            } else{
                const products = category.products;

                for (const product of products) {
                    if( product.productId === productId ){

                        for (const image of images) {
                            
                            const result = await uploadImageToCloud( image.tempFilePath, "product_images" );
    
                            await product.productPhotos.push({
                                photoId: result.public_id,
                                securedURL: result.secure_url,
                            });
                        }

                        category.save();

                        return response.status( 200 ).json({
                            success: true,
                            message: "Images added succesfuly !!",
                            product,
                            category,
                        });
                    }

                    return response.status( 400 ).json({
                        success: false,
                        message: "Product not found !! Please provide valid Product !!",
                    });
                }
            }

        } else{
            response.status( 401 ).json({
                success: false,
                message: "Please provide image to add the image !!"
            });
        }
    } else{
        response.status( 401 ).json({
            success: false,
            message: "Please provide product-id and category-id to add the image !!"
        });
    }
};

exports.deleteImageOfAProduct = async( request, response )=>{
    const categoryId = request.query.categoryId;
    const productId = request.query.productId;
    const imageId = request.query.imageId;

    if( categoryId && productId && imageId ){
        await Category.findOne({ categoryId })
        .then(( category )=>{
            const products = category.products;
            const productsLength = category.products.length;

            for( let index = 0; index < productsLength; index++ ){
                if( products[index].productId === productId ){
                    const product = products[index].productId;
                    const productPhotos = product[index].productPhotos;
                    const imagesLength = product.productPhotos.length;

                    for( let imgIndex = 0; imgIndex < imagesLength; imgIndex++ ){
                        if( productPhotos[imgIndex].photoId === imageId ){
                            product[index].productPhotos.splice( imgIndex, 1 );

                            await category.save();

                            return response.status( 200 ).json({
                                success: true,
                                message: "Image deleted succesfuly !!",
                                product,
                            });
                        }
                    }

                    return response.status( 400 ).json({
                        success: false,
                        message: "Image not found !! Please provide valid image-id !!"
                    });
                }
            }

            return response.status( 400 ).json({
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
            message: "Category-id, product id and image-id is requires to delete the image !!"
        });
    }
};