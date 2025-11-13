// controllers/orderController.js
const { Order, OrderItem, Product, User } = require('../models'); // Assuming a central index.js for models
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const sequelize = require('../db/sequelize'); // Import the main sequelize instance for transactions

// --- CREATE ORDER ---
const createOrder = async (req, res) => {
    // The frontend sends an array of items. Each item needs a productId and quantity.
    // The simplified schema doesn't have shippingFee, so we'll omit it.
    const { items: cartItems } = req.body;

    if (!cartItems || cartItems.length < 1) {
        throw new CustomError.BadRequestError('No cart items provided');
    }

    let subtotal = 0;
    const orderItemsToCreate = [];
    const productIds = cartItems.map(item => item.productId);

    // Fetch all products from the cart in a single query for efficiency
    const productsInCart = await Product.findAll({
        where: { product_id: productIds }
    });

    // A helper map for quick lookups
    const productMap = new Map(productsInCart.map(p => [p.product_id, p]));

    for (const item of cartItems) {
        const dbProduct = productMap.get(item.productId);
        if (!dbProduct) {
            throw new CustomError.NotFoundError(`No product with id: ${item.productId}`);
        }

        const { product_id, title, price } = dbProduct;
        
        // Add to subtotal
        subtotal += item.quantity * price;

        // Prepare the order item for creation
        orderItemsToCreate.push({
            product_id,
            quantity: item.quantity,
            price_at_purchase: price,
        });
    }

    const total = subtotal; // In this simplified model, total is the subtotal

    // --- USE A TRANSACTION TO ENSURE DATA INTEGRITY ---
    const t = await sequelize.transaction();
    try {
        // 1. Create the main Order record
        const order = await Order.create({
            total_amount: total,
            status: 'paid',
            customer_id: req.user.userId,
        }, { transaction: t });

        // 2. Add the order_id to each item before bulk creation
        const finalOrderItems = orderItemsToCreate.map(item => ({
            ...item,
            order_id: order.order_id,
        }));

        // 3. Create all OrderItem records in a single, efficient query
        await OrderItem.bulkCreate(finalOrderItems, { transaction: t });

        // If all queries were successful, commit the transaction
        await t.commit();

        res.status(StatusCodes.CREATED).json({ order });
    } catch (error) {
        // If any query failed, roll back all previous queries in the transaction
        await t.rollback();
        throw new CustomError.InternalServerError('Order creation failed. Please try again.');
    }
};
const getMyPurchasedItems = async (req, res) => {
    // 1. Find all of the user's completed ('paid') orders
    const orders = await Order.findAll({
        where: { customer_id: req.user.userId, status: 'paid' }
    });

    if (!orders.length) {
        return res.status(StatusCodes.OK).json({ items: [] });
    }

    const orderIds = orders.map(o => o.order_id);

    // 2. Find all order items linked to those orders and populate product details
    const items = await OrderItem.findAll({
        where: { order_id: orderIds },
        include: [{
            model: Product,
            as: 'product',
            include: [{ // Also include the artist of the product
                model: User,
                as: 'artist',
                attributes: ['username']
            }]
        }]
    });

    res.status(StatusCodes.OK).json({ items });
};

// --- GET CURRENT USER'S ORDER HISTORY ---
const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.findAll({
        where: { customer_id: req.user.userId },
        order: [['order_date', 'DESC']],
    });

    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};


// --- GET SINGLE ORDER ---
const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    
    const order = await Order.findByPk(orderId, {
        // Use 'include' to fetch associated data (JOINs in SQL)
        include: [
            {
                model: OrderItem,
                as: 'items', // This alias must match your association definition
                include: [{ // Nested include to get product details for each item
                    model: Product,
                    as: 'product',
                    attributes: ['title', 'image_url', 'price']
                }]
            },
            {
                model: User,
                as: 'customer',
                attributes: ['user_id', 'username', 'email']
            }
        ]
    });

    if (!order) {
        throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }

    // Security check: ensure user is admin or owner of the order
    checkPermissions(req.user, order.customer_id);

    res.status(StatusCodes.OK).json({ order });
};


// --- ADMIN ONLY: GET ALL ORDERS ---
const getAllOrders = async (req, res) => {
    const orders = await Order.findAll({
        order: [['order_date', 'DESC']],
        include: [{
            model: User,
            as: 'customer',
            attributes: ['user_id', 'username']
        }]
    });
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};


module.exports = {
    createOrder,
    getCurrentUserOrders,
    getSingleOrder,
    getAllOrders,
    getMyPurchasedItems
};