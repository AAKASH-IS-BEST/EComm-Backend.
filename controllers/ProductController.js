const Product = require("../model/Product");
const uuid = require("uuid").v4;

exports.addProduct = async( request, response )=>{
    console.log( request.body );

    const { productName, productDescription } = request.body;


    const productId = uuid();

    // console.log( productId + "-" + productName + "-" + productDescription );

    await Product.create({
        productId,
        productName,
        productDescription
    })
    .then(( product )=>{
        response.status( 201 ).json({
            success: true,
            product
        })
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            success: false,
            error
        });
    });

};

exports.getProducts = async( request, response )=>{
    await Product.find()
    .then(( products )=>{
        response.status( 200 ).json({
            success: true,
            products
        })
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            status: 402,
            message: "Error while loading products...",
            error,
        })
    });
};

exports.getProductById = async( request, response )=>{
    const productId = request.params.id;

    await Product.findOne({ productId })
    .then(( product )=>{
        response.status( 200 ).json({
            success: true,
            product,
        })
    })
    .catch(( error )=>{
        response.status( 402 ).json({
            success: false,
            error
        });
    });
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

