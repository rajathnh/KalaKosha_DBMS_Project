// models/index.js

const sequelize = require('../db/sequelize');
const { DataTypes } = require('sequelize');

// Import all your model definitions
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');
const Event = require('./Event');
const EventAttendee = require('./EventAttendee');

// --- DEFINE ASSOCIATIONS ---

// User (Artist) and Product
User.hasMany(Product, { foreignKey: 'artist_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'artist_id', as: 'artist' });

// User (Customer) and Order
User.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Order and OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Product and OrderItem
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User and Review
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Product and Review
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User (Artist) and BlogPost
User.hasMany(BlogPost, { foreignKey: 'artist_id', as: 'blogPosts' });
BlogPost.belongsTo(User, { foreignKey: 'artist_id', as: 'artist' });

// BlogPost and Comment
BlogPost.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(BlogPost, { foreignKey: 'post_id', as: 'blogPost' });

// User and Comment
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User (Artist) and Event
User.hasMany(Event, { foreignKey: 'host_id', as: 'hostedEvents' });
Event.belongsTo(User, { foreignKey: 'host_id', as: 'host' });

// User and Event (Many-to-Many for attendees)
User.belongsToMany(Event, { through: EventAttendee, foreignKey: 'user_id', as: 'attendedEvents' });
Event.belongsToMany(User, { through: EventAttendee, foreignKey: 'event_id', as: 'attendees' });

// Export all models and the sequelize instance
module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Review,
  BlogPost,
  Comment,
  Event,
  EventAttendee,
};