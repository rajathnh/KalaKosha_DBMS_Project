// controllers/reviewController.js

const { Review, Product, Order, OrderItem, User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const updateProductRating = require('../utils/updateProductRating'); // <-- IMPORT THE HELPER

// --- CREATE A NEW REVIEW ---
const createReview = async (req, res) => {
    const { productId, rating, comment, title } = req.body; // Added title back for ReviewForm
    const { userId } = req.user;

    if (productId === undefined || rating === undefined || !title || !comment) {
        throw new CustomError.BadRequestError('Please provide product ID, rating, title, and comment.');
    }

    // 1. VERIFY PURCHASE
    const purchasedItem = await OrderItem.findOne({
        where: { product_id: productId },
        include: [{
            model: Order,
            as: 'order',
            where: { customer_id: userId, status: 'paid' },
            required: true,
        }],
    });
    if (!purchasedItem) {
        throw new CustomError.UnauthorizedError('You must purchase this product to leave a review.');
    }

    // 2. CHECK PRODUCT EXISTS
    if (!(await Product.findByPk(productId))) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    // 3. PREVENT DUPLICATE REVIEWS
    if (await Review.findOne({ where: { user_id: userId, product_id: productId } })) {
        throw new CustomError.BadRequestError('You have already submitted a review for this product.');
    }

    // 4. CREATE THE REVIEW
    const review = await Review.create({ rating, title, comment, user_id: userId, product_id: productId });

    // 5. UPDATE PRODUCT RATING (THE JAVASCRIPT WAY)
    await updateProductRating(productId); // <-- CALL THE HELPER

    res.status(StatusCodes.CREATED).json({ review });
};

// --- GET ALL REVIEWS FOR A SPECIFIC PRODUCT ---
const getReviewsForProduct = async (req, res) => {
    const { productId } = req.params;
    const reviews = await Review.findAll({
        where: { product_id: productId },
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['user_id', 'username'] }]
    });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

// --- UPDATE A REVIEW ---
const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) { throw new CustomError.NotFoundError(`No review with id ${reviewId}`); }

    checkPermissions(req.user, review.user_id);

    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    
    // UPDATE PRODUCT RATING AFTER THE REVIEW IS UPDATED
    await updateProductRating(review.product_id); // <-- CALL THE HELPER

    res.status(StatusCodes.OK).json({ review });
};

// --- DELETE A REVIEW ---
const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findByPk(reviewId);

    if (!review) { throw new CustomError.NotFoundError(`No review with id ${reviewId}`); }

    checkPermissions(req.user, review.user_id);
    const productId = review.product_id; // Get the productId BEFORE destroying the review
    await review.destroy();

    // UPDATE PRODUCT RATING AFTER THE REVIEW IS DELETED
    await updateProductRating(productId); // <-- CALL THE HELPER

    res.status(StatusCodes.OK).json({ msg: 'Success! Review removed.' });
};

module.exports = {
    createReview,
    getReviewsForProduct,
    updateReview,
    deleteReview,
};