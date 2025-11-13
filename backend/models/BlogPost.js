// models/blogPost.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const BlogPost = sequelize.define('BlogPost', {
    post_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Blog post title cannot be empty.'
            }
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    featured_image_url: {
        type: DataTypes.STRING,
        allowNull: true, // An image might be optional
        validate: {
            isUrl: {
                msg: 'Please provide a valid URL for the featured image.'
            }
        }
    },
    // The artist_id foreign key will be added by the User-BlogPost association.
}, {
    tableName: 'blog_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// Associations for this model will be defined in a central file.
// - BlogPost.belongsTo(User, { as: 'artist' })
// - BlogPost.hasMany(Comment)

module.exports = BlogPost;