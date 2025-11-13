// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

// CORRECTED: We only import the functions that actually exist in the new controller.
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
} = require('../controllers/orderController');


// A logged-in user creates an order or an admin gets all orders.
router.route('/')
    .post(authenticateUser, createOrder)
    .get([authenticateUser, authorizePermissions('admin')], getAllOrders);


// Route for the current logged-in user to see their own order history.
router.route('/my-orders').get(authenticateUser, getCurrentUserOrders);


// Route to view a single specific order.
// A user can only view their own order, but an admin can view any.
router.route('/:id').get(authenticateUser, getSingleOrder);


module.exports = router;