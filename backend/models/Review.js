// models/review.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const Review = sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Rating must be at least 1.'
            },
            max: {
                args: [5],
                msg: 'Rating cannot be more than 5.'
            }
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true // A review can be just a rating without a comment
    },
    // Foreign keys (user_id, product_id) will be added via associations.
}, {
    tableName: 'reviews',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,

    // This creates a unique constraint to ensure a user
    // can only review a specific product once.
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id']
        }
    ]
});

// Associations for this model will be defined in a central file.
// - Review.belongsTo(User)
// - Review.belongsTo(Product)

module.exports = Review;