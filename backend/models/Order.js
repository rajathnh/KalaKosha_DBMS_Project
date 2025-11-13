// models/order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'paid', 'delivered', 'cancelled']]
        }
    },
    // The customer_id foreign key column will be added by Sequelize
    // when the User-Order association is defined.
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'order_date', // Map createdAt to 'order_date' to match the ER diagram
    updatedAt: false,
});

// Note: Associations (like Order.hasMany(OrderItem)) will be defined
// in a central file.

module.exports = Order;