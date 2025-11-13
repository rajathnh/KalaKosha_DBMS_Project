// models/orderItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const OrderItem = sequelize.define('OrderItem', {
    order_item_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },
    // It's crucial to store the price at the time of purchase,
    // in case the product's price changes later.
    price_at_purchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    // The foreign keys (order_id, product_id) will be added automatically
    // by Sequelize when we define the associations.
}, {
    tableName: 'order_items',
    timestamps: false, // This table typically doesn't need its own timestamps
});

// Associations for this model will be defined in a central file.
// - OrderItem.belongsTo(Order)
// - OrderItem.belongsTo(Product)

module.exports = OrderItem;