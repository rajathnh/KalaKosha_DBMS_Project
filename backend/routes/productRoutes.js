const express = require('express');
const router = express.Router();
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getCurrentUserProducts,
} = require('../controllers/productController');

router
  .route('/')
  .post([authenticateUser, authorizePermissions('artist')], createProduct)
  .get(getAllProducts);

router
  .route('/my-products')
  .get([authenticateUser, authorizePermissions('artist')], getCurrentUserProducts);

router
  .route('/:id')
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions('artist')], updateProduct)
  .delete([authenticateUser, authorizePermissions('artist')], deleteProduct);

module.exports = router;