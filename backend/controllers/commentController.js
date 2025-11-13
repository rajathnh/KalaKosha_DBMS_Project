// controllers/commentController.js
const { Comment, BlogPost, User } = require('../models'); // Assuming a central index.js for models
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

// --- CREATE A NEW COMMENT ---
const createComment = async (req, res) => {
    // Frontend sends the content and the ID of the post being commented on.
    const { postId, content } = req.body;
    
    if (!postId || !content) {
        throw new CustomError.BadRequestError('Please provide post ID and comment content.');
    }

    // First, verify that the blog post actually exists
    const postExists = await BlogPost.findByPk(postId);
    if (!postExists) {
        throw new CustomError.NotFoundError(`No blog post with id: ${postId}`);
    }
    
    // The user ID comes from the authentication middleware
    const commentData = {
        content,
        post_id: postId,
        user_id: req.user.userId,
    };

    const comment = await Comment.create(commentData);
    res.status(StatusCodes.CREATED).json({ comment });
};

// --- GET ALL COMMENTS FOR A BLOG POST (Public) ---
const getPostComments = async (req, res) => {
    const { postId } = req.params;
    const comments = await Comment.findAll({
        where: { post_id: postId },
        include: [{
            model: User,
            as: 'user',
            attributes: ['user_id', 'username'] // Only show the commenter's public info
        }],
        order: [['created_at', 'ASC']], // Sort oldest to newest
    });

    res.status(StatusCodes.OK).json({ comments, count: comments.length });
};

// --- UPDATE A COMMENT ---
const updateComment = async (req, res) => {
    const { id: commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new CustomError.BadRequestError('Comment content cannot be empty.');
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
        throw new CustomError.NotFoundError(`No comment with id: ${commentId}`);
    }

    // Security Check: Only the author of the comment can edit it.
    checkPermissions(req.user, comment.user_id);

    comment.content = content;
    await comment.save();

    res.status(StatusCodes.OK).json({ comment });
};

// --- DELETE A COMMENT ---
const deleteComment = async (req, res) => {
    const { id: commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
        throw new CustomError.NotFoundError(`No comment with id: ${commentId}`);
    }

    // --- Advanced Permission Check ---
    // A comment can be deleted by EITHER its author OR the author of the blog post.
    const post = await BlogPost.findByPk(comment.post_id);
    
    const isCommentAuthor = req.user.userId === comment.user_id;
    // Ensure post is not null before checking its artist_id
    const isPostAuthor = post ? req.user.userId === post.artist_id : false;

    if (!isCommentAuthor && !isPostAuthor) {
        throw new CustomError.UnauthorizedError('Not authorized to delete this comment');
    }

    await comment.destroy();
    res.status(StatusCodes.OK).json({ msg: 'Success! Comment removed.' });
};

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
};