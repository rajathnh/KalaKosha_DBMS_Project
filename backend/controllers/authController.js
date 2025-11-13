// controllers/authController.js

const { User } = require('../models'); // Correctly destructure the User model
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

// --- REGISTER A NEW USER (HANDLES BOTH CUSTOMERS AND ARTISTS) ---
const register = async (req, res) => {
    // The frontend will send a 'role' field ('customer' or 'artist')
    const { email, name, password, role, bio } = req.body;

    if (!email || !name || !password || !role) {
        throw new CustomError.BadRequestError('Please provide name, email, password, and role.');
    }

    // Artist-specific validation
    if (role === 'artist' && !bio) {
        throw new CustomError.BadRequestError('Please provide a bio for your artist profile.');
    }

    // Check if email is already in use
    const emailAlreadyExists = await User.findOne({ where: { email } });
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('An account with this email already exists.');
    }
    
    // Using 'name' from request body for the 'username' column to maintain API consistency
    const usernameAlreadyExists = await User.findOne({ where: { username: name } });
    if (usernameAlreadyExists) {
        throw new CustomError.BadRequestError('This username is already taken.');
    }
    
    // Prepare user data for creation
    const userData = {
        username: name,
        email,
        password, // The model's 'beforeCreate' hook will hash this before saving
        role,
        bio: role === 'artist' ? bio : null, // Only save bio if the user is an artist
    };

    const user = await User.create(userData);

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.CREATED).json({ user: tokenUser });
};


// --- LOGIN FOR ALL USER ROLES ---
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }

    // Find the user in the single 'users' table
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    // Use the comparePassword method defined on our Sequelize model's prototype
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({ user: tokenUser });
};


// --- LOGOUT --- (No changes needed)
const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
};


module.exports = {
    register, // We now export a single, unified 'register' function
    login,
    logout,
};