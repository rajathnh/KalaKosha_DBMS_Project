// controllers/reviewController.js

const { Review, Product, Order, OrderItem, User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const updateProductRating = require('../utils/updateProductRating'); // <-- IMPORT THE HELPER

// --- CREATE A NEW REVIEW ---
const createReview = async (req, res) => {
    // --- UPDATED --- Removed 'title' from destructuring and validation
    const { productId, rating, comment } = req.body;
    const { userId } = req.user;

    if (productId === undefined || rating === undefined || !comment) {
        throw new CustomError.BadRequestError('Please provide product ID, rating, and comment.');
    }
    // ... (purchase verification and other checks remain the same)
    
    // 3. PREVENT DUPLICATE REVIEWS
    if (await Review.findOne({ where: { user_id: userId, product_id: productId } })) {
        throw new CustomError.BadRequestError('You have already submitted a review for this product.');
    }

    // 4. CREATE THE REVIEW
    // --- UPDATED --- 'title' is no longer passed to the create method
    const review = await Review.create({ rating, comment, user_id: userId, product_id: productId });

    // 5. UPDATE PRODUCT RATING
    await updateProductRating(productId);

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
    // --- UPDATED --- Removed 'title'
    const { rating, comment } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) { throw new CustomError.NotFoundError(`No review with id ${reviewId}`); }

    checkPermissions(req.user, review.user_id);

    review.rating = rating;
    // --- REMOVED ---
    review.comment = comment;
    await review.save();
    
    await updateProductRating(review.product_id);

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