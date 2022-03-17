const uuid = require("uuid").v4;
const fileUpload = require("file-upload");
const cloudinary = require("cloudinary");
const Category = require("../model/Category");
const { validationResult } = require("express-validator");

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

exports.addCategory = async( request, response )=>{
    if( request.files ){

        const validationError = validationResult( request );

        if( !validationError.isEmpty() ){
            return response.status( 422 ).json({
                success: false,
                message: "Validation errors: "+ validationError.array()[0].msg,
                error: validationError.array()[0].msg
            });
        }

        const { categoryName, categoryDescription, categoryStatus, parentId } = request.body;

        const categoryPhotosReq = request.files.categoryPhotos;
        
        const categoryPhotos = [];

        // When there is only single photo, 'categoryPhotosReq' will be simple object so there will be 'undefined' for its length property... 
        if( categoryPhotosReq.length === undefined ){
            const result = await uploadImageToCloud( categoryPhotosReq.tempFilePath, "category_images" );
           
            await categoryPhotos.push({
                photoId: result.public_id,
                securedURL: result.secure_url
            });

        // When there will be multiple photos, 'categoryPhotosReq' will be array so we iterate over them and upload them to the cloud one by one...
        } else {
            for( let photo of categoryPhotosReq ){
                const result = await uploadImageToCloud( photo.tempFilePath, "category_images" );

                await categoryPhotos.push({
                    photoId: result.public_id,
                    securedURL: result.secure_url
                });
            }
        }

        const categoryId = await uuid();

        Category.create({
            categoryId,
            categoryName,
            categoryPhotos,
            categoryDescription,
            categoryStatus,
            parentId
        })
        .then(( category )=>{
            response.status( 201 ).json({
                success: true,
                category
            });
        })
        .catch(( error )=>{
            response.status( 402 ).json({
                success: false,
                message: "Error while creating the category...",
                error
            });
        });

    } else{
        response.status( 400 ).json({
            success: false,
            message: "Please provide category images !!"
        });
    }
};

exports.getCategories = async( request, response )=>{
    await Category.find()
    .then(( categories )=>{
        response.status( 200 ).json({
            success: true,
            categories
        });
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            success: false,
            message: "Error while getting the category...",
            error
        });
    });
};

exports.getCategory = async( request, response )=>{
    const categoryId = request.params.id;

    console.log( categoryId );

    await Category.findOne({ categoryId }) 
    .then(( category )=>{
        response.status( 200 ).json({
            success: true,
            category
        });
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            success: false,
            message: "Error while getting the category...",
            error
        });
    });
};

exports.updateCategory = async( request, response )=>{
    const categoryId = request.params.id;

    const validationError = validationResult( request );

    if( !validationError.isEmpty() ){
        return response.status( 422 ).json({
            success: false,
            message: "Validation errors: "+ validationError.array()[0].msg,
            error: validationError.array()[0].msg
        });
    } else if( categoryId === undefined || categoryId === null ){
        return response.status( 422 ).json({
            success: false,
            message: "Please provide category-id to update the category !!",
        });
    }

    const { categoryName, categoryDescription, categoryStatus } = request.body;

    await Category.findOne({ categoryId })
    .then(( category )=>{
        category.categoryName = categoryName;
        category.categoryDescription = categoryDescription;
        category.categoryStatus = categoryStatus;
        category.categoryUpdatedAt = Date.now();

        category.save();

        response.status( 200 ).json({
            success: true,
            category
        });
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            success: false,
            error
        });
    });
};

exports.deleteCategory = async( request, response )=>{
    const categoryId = request.params.id;
    
    if( categoryId ){

        const category = await Category.findOne({ categoryId });

        if( category ){

            let flag = true;

            if( category.categoryPhotos.length != undefined ){

                for (let index = 0; index < category.categoryPhotos.length; index++) {

                    const resp = await deleteImageFromCloud( category.categoryPhotos[ index ].photoId );

                    if( resp === undefined ){
                        flag = false;
                    } else if( resp["result"] === "not found"){
                        flag = false;
                    } else if( resp["result"] === "ok" ){
                        /*
                        -> So I was facing one issue here that, suppose there is 3 images in the array so because of above loop, we 
                        first delete the first images than suppose while deleting second image, we get some error, so we through the 
                        error and user retry to delete the category but as we have not first deleted image from the current category's
                        photos array, when user going to delete the category once again, that not removes image object try to get deleted
                        once again and as that image is already deleted from the cloud but not removes from the array, it will thorough the error 
                        that image not found and this will keep going on so this is bug and in order to remove that, we have to delete image object
                        from the array after succesful deletion from cloud so this situation dont came !! 
                        */
                        category.categoryPhotos.splice( index, 1 );
                    }
                }
            }

            if( flag ){
                await Category.deleteOne({ categoryId })
                .then(( category )=>{
                    response.status( 200 ).json({
                        success: true,
                        message: "Category deleted succesfuly !!",
                        category
                    });
                })
                .catch(( error )=>{
                    response.status( 402 ).json({
                        success: false,
                        message: "Error while deleting the category...",
                        error
                    });
                });
            } else{
                response.status( 402 ).json({
                    success: false,
                    message: "Error while deleting the photos !! Please try again !!"
                });
            }
        } else{
            response.status( 402 ).json({
                success: false,
                message: "No Category found !! Please enter proper category id !!!",
            });
        }
    } else{
        response.status( 402 ).json({
            success: false,
            message: "Please provide category-id to delete the category..."
        });
    }
};

// TODO ::::
exports.inactiveCategory = async( request, response )=>{
    console.log("Inactive");
    const categoryId = request.params.categoryId;

    console.log( "Inactive: ", categoryId );

    if( categoryId ){
        await Category.findOne({ categoryId })
        .then(( category )=>{
            category.categoryStatus = "Inactive";

            category.save();

            response.status( 200 ).json({
                success: true,
                category
            });
        })
        .catch(( error )=>{
            response.status( 401 ).json({
                success: false,
                message: "No category found !! please enter valid category !!",
                error,
            });
        });
    } else{
        response.status( 401 ).json({
            success: false,
            message: "Please provide category-id to make it inactive !!"
        });
    }
};

exports.getProductsOfACategory = async( request, response )=>{
    const categoryId = request.params.categoryId;

    if( categoryId ){
        await Category.findOne({ categoryId })
        .then(( category )=>{
            console.log( category );
            console.log( category.products );

            const products = new Array( category.products );

            response.status( 200 ).json({
                success: true,
                products
            });
        })
        .catch(( error )=>{
            response.status( 400 ).json({
                success: false,
                message: "Invalid category-id !! Please provide valid category-id !!",
                error
            });
        });
    } else{
        response.status( 400 ).json({
            success: false,
            message: "Please provide category-id to get products of it !!",
        });
    }
};

exports.getAllParentCategories = async( request, response )=>{
    await Category.find({ parentId: null })
    .then(( categories )=>{
        response.status( 200 ).json({
            success: true,
            categories
        });
    })
    .catch(( error )=>{
        response.status( 400 ).json({
            success: false,
            message: "Unable to load parent categories !! please try again !!",
            error
        });
    });
};

exports.getChildCategoriesOfACategory = async( request, response )=>{
    const categoryId = request.params.categoryId;

    console.log( categoryId );

    if( categoryId ){
        await Category.find({ parentId: categoryId })
        .then(( categories )=>{
            response.status( 200 ).json({
                success: true,
                categories
            });
        })
        .catch(( error )=>{
            response.status( 400 ).json({
                success: false,
                message: "Error finding categories !! Please try again !!",
                error
            });
        });
    } else{
        response.status( 400 ).json({
            success: false,
            message: "Please provide category-id to find child categories !!",
        });
    }
};

exports.addImageToACategory = async( request, response )=>{
    const { categoryId } = request.params;

    console.log("Add-Image", categoryId);

    if( categoryId ){
        if( request.files ){
            const images = request.files.categoryImages;

            if( images.length === undefined ){
                const category = await Category.findOne({ categoryId });

                if( !category ){
                    return response.status( 400 ).json({
                        success: false,
                        message: "Invalid category-id !! please provide valid category-id !!",
                    });
                }

                const result = await uploadImageToCloud( images.tempFilePath, "category_images" );

                await category.categoryPhotos.push({
                    photoId: result.public_id,
                    securedURL: result.secure_url,
                });

                category.save();

                response.status( 200 ).json({
                    success: true,
                    message: "Image addes succesfully !!",
                    category
                });

            } else{
                const category = await Category.findOne({ categoryId });

                if( !category ){
                    return response.status( 400 ).json({
                        success: false,
                        message: "Invalid category-id !! please provide valid category-id !!",
                    });
                }

                for (let index = 0; index < images.length; index++) {
                    const result = await uploadImageToCloud( images[index].tempFilePath, "category_images" );

                    await category.categoryPhotos.push({
                        photoId: result.public_id,
                        securedURL: result.secure_url,
                    });   
                }

                category.save();

                response.status( 200 ).json({
                    success: true,
                    message: "Image addes succesfully !!",
                    category
                });
            }
        } else{
            response.status( 400 ).json({
                success: false,
                message: "Image file are missing !! please provide images to add the images !!"
            });
        }


    } else{
        response.status( 400 ).json({
            success: false,
            message: "category-id is missing !! Please provide category-id to add the image !!"
        });
    }
};

exports.deleteImageFromACategory = async( request, response )=>{
    const categoryId = request.params.categoryId;
    const imageId = request.query.imageId;

    if( categoryId && imageId ){
        const category = await Category.findOne({ categoryId });

        if( !category ){
            return response.status( 400 ).json({
                success: false,
                message: "Invalid Category-id !! Please provide valid category !!"
            });
        }

        const images = category.categoryPhotos;
        let flag = false;

        for( let index = 0; index < images.length; index++ ){
            if( images[index].photoId === imageId ){

                flag = true;

                const resp = await deleteImageFromCloud( images[index].photoId );

                if( resp === undefined ){
                    response.status( 402 ).json({
                        success: false,
                        message: "Error while deleting the image !!"+ resp,
                        resp
                    });
                } else if( resp["result"] === "not found"){
                    response.status( 400 ).json({
                        success: false,
                        message: "Invalid Image !! please provide valid image !!"+ resp,
                        resp
                    });
                } else if( resp["result"] === "ok" ){
                    category.categoryPhotos.splice( index, 1 );

                    response.status( 200 ).json({
                        success: true,
                        message: "Image deleted succesfuly !!"
                    });
                }
            }
        }

        await category.save();

        if( !flag ){
            response.status( 400 ).json({
                success: false,
                message: "Image not found !! Please provide valid image !!"
            });
        }

    } else{
        response.status( 400 ).json({
            success: false,
            message: "Image-id or category-id is missing !! Please provide image-id and category-id to delete the image !!"
        });
    }
};