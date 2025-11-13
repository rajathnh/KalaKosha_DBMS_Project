// controllers/reviewController.js

const { Review, Product, Order, OrderItem, User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

// --- CREATE A NEW REVIEW ---
const createReview = async (req, res) => {
    // The frontend sends the ID of the product being reviewed.
    const { productId, rating, comment } = req.body;
    const { userId } = req.user;

    if (productId === undefined || rating === undefined) {
        throw new CustomError.BadRequestError('Please provide a product ID and a rating.');
    }

    // 1. VERIFY PURCHASE: Check if the user has a 'delivered' order containing this product.
    // This is a critical business rule for an e-commerce platform.
    const purchasedItem = await OrderItem.findOne({
        where: { product_id: productId },
        include: [{
            model: Order,
            as: 'order',
            where: {
                customer_id: userId,
                status: 'paid' // Enforce that the item must be received.
            },
            required: true, // This ensures it's an INNER JOIN.
        }],
    });

    if (!purchasedItem) {
        throw new CustomError.UnauthorizedError('You can only review products you have purchased and received.');
    }

    // 2. CHECK PRODUCT EXISTS: Ensure the product being reviewed is valid.
    const isValidProduct = await Product.findByPk(productId);
    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    // 3. PREVENT DUPLICATE REVIEWS: Check if the user has already reviewed this product.
    // The database also has a unique constraint for this, but checking here provides a cleaner error message.
    const alreadySubmitted = await Review.findOne({
        where: { user_id: userId, product_id: productId },
    });
    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('You have already submitted a review for this product.');
    }

    // 4. CREATE THE REVIEW
    const reviewData = {
        rating,
        comment,
        user_id: userId,
        product_id: productId,
    };
    const review = await Review.create(reviewData);

    // NOTE: We do NOT manually update the product's average rating.
    // The SQL TRIGGER you implemented on the 'reviews' table handles this automatically.
    // This is a key feature of the relational database implementation.

    res.status(StatusCodes.CREATED).json({ review });
};

// --- GET ALL REVIEWS FOR A SPECIFIC PRODUCT ---
const getReviewsForProduct = async (req, res) => {
    const { productId } = req.params;
    const reviews = await Review.findAll({
        where: { product_id: productId },
        order: [['created_at', 'DESC']],
        include: [{
            model: User,
            as: 'user',
            attributes: ['user_id', 'username'] // Only include public user info
        }]
    });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};


// --- UPDATE A REVIEW ---
const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, comment } = req.body;

    if (rating === undefined || comment === undefined) {
        throw new CustomError.BadRequestError('Please provide rating and comment.');
    }

    const review = await Review.findByPk(reviewId);
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
    }

    // Check if the logged-in user is the author of the review.
    checkPermissions(req.user, review.user_id);

    // Update fields and save to the database.
    review.rating = rating;
    review.comment = comment;
    await review.save();
    
    // The SQL TRIGGER will automatically recalculate the product's average rating on this UPDATE.

    res.status(StatusCodes.OK).json({ review });
};


// --- DELETE A REVIEW ---
const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findByPk(reviewId);

    if (!review) {
        throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
    }

    checkPermissions(req.user, review.user_id);
    await review.destroy();

    // The SQL TRIGGER will automatically recalculate the product's average rating on this DELETE.

    res.status(StatusCodes.OK).json({ msg: 'Success! Review removed.' });
};


module.exports = {
    createReview,
    getReviewsForProduct,
    updateReview,
    deleteReview,
};