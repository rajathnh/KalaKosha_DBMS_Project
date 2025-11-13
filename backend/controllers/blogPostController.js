// controllers/blogPostController.js
const { BlogPost,User}= require('../models'); 
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { Op } = require('sequelize');

// --- CREATE BLOG POST (Artist only) ---
const createBlogPost = async (req, res) => {
    // 1. VALIDATE FILE UPLOAD
    // The name 'featuredImage' must exactly match the name attribute of the file input in your frontend form.
    if (!req.files || !req.files.featuredImage) {
      throw new CustomError.BadRequestError('No featured image file uploaded.');
    }

    const blogImage = req.files.featuredImage;

    // Optional: You can add more validation here for file type or size if needed.
    // e.g., if (!blogImage.mimetype.startsWith('image')) { ... }

    // 2. UPLOAD TO CLOUDINARY
    // 'express-fileupload' saves the uploaded file to a temporary path on your server.
    const result = await cloudinary.uploader.upload(blogImage.tempFilePath, {
        use_filename: true, // Use the original filename
        folder: 'kalakosha-blogs-sql', // A dedicated folder in Cloudinary for organization
    });

    // 3. CLEAN UP TEMPORARY FILE
    // It's important to delete the temp file to free up server space.
    fs.unlinkSync(blogImage.tempFilePath);

    // 4. PREPARE DATA FOR DATABASE
    // Get the text fields from the request body
    const { title, content } = req.body;
    if (!title || !content) {
        throw new CustomError.BadRequestError('Please provide a title and content for the blog post.');
    }
    
    const postData = {
        title,
        content,
        // Add the secure URL returned by Cloudinary to your data object.
        featured_image_url: result.secure_url,
        // Set the author's ID from the authenticated user's token.
        artist_id: req.user.userId,
    };

    // 5. CREATE THE DATABASE RECORD
    const blogPost = await BlogPost.create(postData);

    res.status(StatusCodes.CREATED).json({ blogPost });
};


// --- GET ALL BLOG POSTS (Public) ---
const getAllBlogPosts = async (req, res) => {
    const { search, sort } = req.query;

    const where = {};
    if (search) {
        where[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { content: { [Op.iLike]: `%${search}%` } },
        ];
    }

    let order = [['created_at', 'DESC']]; // Default to latest
    if (sort === 'oldest') {
        order = [['created_at', 'ASC']];
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: blogPosts } = await BlogPost.findAndCountAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: User,
            as: 'artist',
            attributes: ['user_id', 'username']
        }]
    });

    const numOfPages = Math.ceil(count / limit);

    res.status(StatusCodes.OK).json({ blogPosts, totalPosts: count, numOfPages });
};

// --- GET SINGLE BLOG POST (Public) ---
const getSingleBlogPost = async (req, res) => {
    const { id: postId } = req.params;
    const blogPost = await BlogPost.findByPk(postId, {
        include: [{
            model: User,
            as: 'artist',
            attributes: ['user_id', 'username', 'bio']
        }]
    });

    if (!blogPost) {
        throw new CustomError.NotFoundError(`No blog post with id: ${postId}`);
    }
    res.status(StatusCodes.OK).json({ blogPost });
};

// --- UPDATE BLOG POST (Artist owner only) ---
const updateBlogPost = async (req, res) => {
    const { id: postId } = req.params;

    const blogPost = await BlogPost.findByPk(postId);
    if (!blogPost) {
        throw new CustomError.NotFoundError(`No blog post with id: ${postId}`);
    }

    checkPermissions(req.user, blogPost.artist_id);

    const [updateCount, updatedPosts] = await BlogPost.update(req.body, {
        where: { post_id: postId },
        returning: true,
    });

    res.status(StatusCodes.OK).json({ blogPost: updatedPosts[0] });
};

// --- DELETE BLOG POST (Artist owner only) ---
const deleteBlogPost = async (req, res) => {
    const { id: postId } = req.params;
    const blogPost = await BlogPost.findByPk(postId);

    if (!blogPost) {
        throw new CustomError.NotFoundError(`No blog post with id: ${postId}`);
    }

    checkPermissions(req.user, blogPost.artist_id);

    await blogPost.destroy();
    res.status(StatusCodes.OK).json({ msg: 'Success! Blog post removed.' });
};

// --- GET CURRENT ARTIST'S BLOGS (for their dashboard) ---
const getCurrentUserBlogs = async (req, res) => {
    const blogPosts = await BlogPost.findAll({
        where: { artist_id: req.user.userId },
        order: [['created_at', 'DESC']]
    });

    res.status(StatusCodes.OK).json({ blogPosts, count: blogPosts.length });
};


module.exports = {
    createBlogPost,
    getAllBlogPosts,
    getSingleBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getCurrentUserBlogs,
};