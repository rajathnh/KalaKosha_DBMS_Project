// models/product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true
        }
    },
    product_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['artwork', 'course']]
        }
    },
    average_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    // The artist_id foreign key will be added automatically by Sequelize
    // when we define the association between User and Product.
}, {
    tableName: 'products',
    timestamps: false, // Your ER diagram does not show timestamps for products
});

// Note: Associations (like Product.belongsTo(User)) will be defined
// in a central file after all models are imported.

module.exports = Product;