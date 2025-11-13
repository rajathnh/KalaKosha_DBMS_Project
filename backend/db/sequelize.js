// db/sequelize.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT, // This will be 'postgres' from your .env
    port: process.env.DB_PORT,
    logging: false, // Set to console.log to see SQL queries
        dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Note: for production, you might want to configure this more securely
      }
    }
  }
);

module.exports = sequelize;