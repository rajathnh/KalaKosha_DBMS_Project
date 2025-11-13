const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
    createReview,
    getReviewsForProduct, // Renamed for clarity
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');

router.route('/').post(authenticateUser, createReview);

// New, cleaner route for getting reviews for a specific product
router.route('/product/:productId').get(getReviewsForProduct);

router.route('/:id')
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);

module.exports = router;