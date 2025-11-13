// utils/updateProductRating.js

const { Product, Review } = require('../models');
const { sequelize } = require('../models'); // Import sequelize for raw queries

// This is the JavaScript equivalent of your database trigger.
const updateProductRating = async (productId) => {
  if (!productId) return;

  try {
    // We use a raw Sequelize query here because it's the most efficient
    // way to perform aggregate calculations (AVG, COUNT).
    const [results] = await sequelize.query(`
      SELECT
        COUNT(*) AS "numOfReviews",
        AVG("rating") AS "averageRating"
      FROM
        "reviews"
      WHERE
        "product_id" = :productId
    `, {
      replacements: { productId: productId },
    });

    const stats = results[0];
    const numOfReviews = parseInt(stats.numOfReviews, 10) || 0;
    // Round the average rating to one decimal place. COALESCE to 0 if null.
    const averageRating = Math.round(parseFloat(stats.averageRating || 0) * 10) / 10;
    
    // Now, update the products table with the new stats.
    await Product.update(
      {
        averageRating: averageRating,
        numOfReviews: numOfReviews,
      },
      {
        where: { product_id: productId },
      }
    );
  } catch (error) {
    // Log the error but don't crash the application.
    // This logic is important but shouldn't block the user's primary action.
    console.error(`Failed to update product rating for productId ${productId}:`, error);
  }
};

module.exports = updateProductRating;