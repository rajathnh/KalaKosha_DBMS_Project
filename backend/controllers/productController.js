// controllers/productController.js
const { Product, User } = require('../models'); // Assuming a central index.js for models
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const { Op } = require('sequelize'); // Import operators for searching
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// --- CREATE PRODUCT (Artist only) ---
const createProduct = async (req, res) => {
    // 1. Destructure the TEXT fields from req.body.
    // The express-fileupload middleware populates this.
    const { title, description, price, product_type } = req.body;

    // 2. Perform validation for the text fields.
    if (!title || !description || !price || !product_type) {
        throw new CustomError.BadRequestError('Please provide title, description, price, and product type.');
    }

    if (!['artwork', 'course'].includes(product_type)) {
        throw new CustomError.BadRequestError('Invalid product_type. Must be "artwork" or "course".');
    }

    // 3. Check for the uploaded file in req.files.
    // The frontend must send the file with the key 'image'.
    if (!req.files || !req.files.image) {
        throw new CustomError.BadRequestError('Please upload an image for the product.');
    }

    const productImage = req.files.image;

    // Optional but recommended: Check if the uploaded file is an image
    if (!productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('Please upload an image file (e.g., jpg, png).');
    }

    // --- 4. Upload the image to Cloudinary ---
    let imageUrl = '';
    try {
        const result = await cloudinary.uploader.upload(
            productImage.tempFilePath, // express-fileupload saves the file temporarily
            {
                use_filename: true, // Use the original filename
                folder: 'kalakosha-products', // A dedicated folder in your Cloudinary account
                resource_type: 'image',
            }
        );

        // After a successful upload, clean up the temporary file from your server's disk
        fs.unlinkSync(productImage.tempFilePath);

        // Store the secure URL provided by Cloudinary
        imageUrl = result.secure_url;

    } catch (error) {
        // If the upload fails, ensure the temp file is still cleaned up if it exists
        if (fs.existsSync(productImage.tempFilePath)) {
            fs.unlinkSync(productImage.tempFilePath);
        }
        console.error('Cloudinary upload failed:', error);
        throw new CustomError.InternalServerError('Image upload failed. Please try again.');
    }

    // --- 5. Prepare the final data for the database ---
    const productData = {
        title,
        description,
        price,
        product_type,
        image_url: imageUrl,       // Use the URL from Cloudinary
        artist_id: req.user.userId, // Set the artist_id from the authenticated user's token
    };

    // 6. Create the product record in your SQL database.
    const product = await Product.create(productData);
    
    // 7. Send the successful response.
    res.status(StatusCodes.CREATED).json({ product });
};

// --- GET ALL PRODUCTS (Public) ---
// Merges getAllArtworks and getAllCourses
const getAllProducts = async (req, res) => {
    const { search, product_type, sort } = req.query;

    const where = {};

    // Filtering by product type (e.g., ?product_type=artwork)
    if (product_type && ['artwork', 'course'].includes(product_type)) {
        where.product_type = product_type;
    }

    // Searching by keyword in title or description (case-insensitive)
    if (search) {
        where[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
        ];
    }
    
    // Sorting logic
    let order = [['product_id', 'DESC']]; // Default sort
    if (sort === 'oldest') order = [['createdAt', 'ASC']];
    if (sort === 'price-lowest') order = [['price', 'ASC']];
    if (sort === 'price-highest') order = [['price', 'DESC']];

    // Pagination logic
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // We use findAndCountAll to get both the data and the total count for pagination
    const { count, rows: products } = await Product.findAndCountAll({
        where,
        order,
        offset,
        limit,
        include: [{
            model: User,
            as: 'artist', // This alias must match the one in your association definition
            attributes: ['user_id', 'username']
        }],
    });
    
    const numOfPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({ products, totalProducts: count, numOfPages });
};

// --- GET SINGLE PRODUCT (Public) ---
const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findByPk(productId, {
        include: [{
            model: User,
            as: 'artist',
            attributes: ['user_id', 'username', 'bio']
        }]
    });

    if (!product) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product });
};

// --- UPDATE PRODUCT (Artist owner only) ---
const updateProduct = async (req, res) => {
    const { id: productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    // Check Permissions: Ensure the logged-in user is the one who created the product
    checkPermissions(req.user, product.artist_id);

    // Update the product. The second element of the returned array is the updated rows.
    const [updateCount, updatedProducts] = await Product.update(req.body, {
        where: { product_id: productId },
        returning: true, // Important for PostgreSQL to return the updated object
    });

    res.status(StatusCodes.OK).json({ product: updatedProducts[0] });
};

// --- DELETE PRODUCT (Artist owner only) ---
const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    // Check Permissions
    checkPermissions(req.user, product.artist_id);

    await product.destroy();
    res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

// --- GET CURRENT ARTIST'S PRODUCTS (for their dashboard) ---
const getCurrentUserProducts = async (req, res) => {
    const where = { artist_id: req.user.userId };

    // Allow filtering by product type on the dashboard as well
    if (req.query.product_type) {
        where.product_type = req.query.product_type;
    }

    const products = await Product.findAll({ where });
    res.status(StatusCodes.OK).json({ products, count: products.length });
};


module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getCurrentUserProducts,
};