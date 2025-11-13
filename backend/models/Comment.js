// models/comment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const Comment = sequelize.define('Comment', {
    comment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Comment content cannot be empty.'
            }
        }
    },
    // The foreign keys (user_id, post_id) will be added automatically
    // when we define the model associations.
}, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// Associations for this model will be defined in a central file.
// - Comment.belongsTo(User)
// - Comment.belongsTo(BlogPost)

module.exports = Comment;