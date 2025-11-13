// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
} = require('../controllers/commentController');

// A logged-in user posts a new comment.
router.route('/').post(authenticateUser, createComment);

// Anyone can view all comments for a specific blog post.
router.route('/post/:postId').get(getPostComments);

// The comment's author (or post's author) can update or delete their comment.
router.route('/:id')
    .patch(authenticateUser, updateComment)
    .delete(authenticateUser, deleteComment);

module.exports = router;