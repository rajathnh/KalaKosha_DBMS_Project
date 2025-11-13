// app.js

// Load environment variables from .env file
require("dotenv").config();


// --- Core Dependencies ---
const express = require("express");
const app = express();
const http = require("http");
const path = require("path");

// --- Security, Utility, and Middleware Packages ---
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
const helmet = require("helmet");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;

// --- Database Connection (NEW) ---
const sequelize = require("./db/sequelize");
// This will also import all our models and their associations
const db = require('./models');

// --- Routers (UPDATED & CLEANED) ---
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const blogPostRouter = require('./routes/blogPostRoutes');
const commentRouter = require('./routes/commentRoutes');
const eventRouter = require('./routes/eventRoutes');

// --- Middleware Imports ---
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// --- Server & Middleware Configuration ---
const server = http.createServer(app);

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use morgan for logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Standard Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Rate Limiting to prevent brute-force attacks


// Parsers for JSON, URL-encoded data, and cookies
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// --- THIS IS THE CRITICAL FIX FOR FILE UPLOADS ---
// It must be configured to use temporary files for Cloudinary to work
app.use(fileUpload({ useTempFiles: true }));

// Serve static assets (if needed)
app.use(express.static(path.join(__dirname, "public")));


// --- API ROUTES ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/blog', blogPostRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/events', eventRouter);


// --- Custom Error Handling Middleware (must be last) ---
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


// --- Server Initialization ---
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    // 1. Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // 2. Sync models with the database.
    // Creates tables if they don't exist based on your Sequelize models.
    await sequelize.sync({ force: true });
    console.log('All models were synchronized successfully.');

    server.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

start();