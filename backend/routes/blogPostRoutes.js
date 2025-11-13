// routes/blogPostRoutes.js

const express = require('express');
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createBlogPost,
  getAllBlogPosts,
  getSingleBlogPost,
  updateBlogPost,
  deleteBlogPost, // Make sure this is imported
  getCurrentUserBlogs,
} = require('../controllers/blogPostController');

// Route for creating a post and getting all posts
router
  .route('/')
  .post([authenticateUser, authorizePermissions('artist')], createBlogPost)
  .get(getAllBlogPosts);

// Route for an artist to get their own blogs
router
  .route('/my-blogs')
  .get([authenticateUser, authorizePermissions('artist')], getCurrentUserBlogs);

// Routes for a single post by its ID
router
  .route('/:id')
  .get(getSingleBlogPost)
  .patch([authenticateUser, authorizePermissions('artist')], updateBlogPost)
  .delete([authenticateUser, authorizePermissions('artist')], deleteBlogPost); // <-- THE FIX: Handler function was missing

module.exports = router;