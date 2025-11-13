// controllers/userController.js

const { User } = require('../models'); // Correctly destructure the User model
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createTokenUser, attachCookiesToResponse } = require('../utils');
const sequelize = require('../db/sequelize');
const { QueryTypes } = require('sequelize');

// --- GET CURRENT LOGGED-IN USER --- (No logical change from original)
const showCurrentUser = async (req, res) => {
    // req.user is attached by our authentication middleware and contains { userId, name, role }
    res.status(StatusCodes.OK).json({ user: req.user });
};
const getArtistProfile = async (req, res) => {
    const { id: artistId } = req.params;

    // Execute the stored procedure!
    const results = await sequelize.query(
        'SELECT get_artist_profile(:artistId)', 
        {
            replacements: { artistId: parseInt(artistId) }, // Ensure ID is an integer
            type: QueryTypes.SELECT,
        }
    );
    
    // The JSON result is in the first row, under the function's name
    const profileData = results[0]?.get_artist_profile;

    if (!profileData || !profileData.artist) {
      throw new CustomError.NotFoundError(`No artist profile found with id: ${artistId}`);
    }

    res.status(StatusCodes.OK).json({ profile: profileData });
};
// --- GET A SINGLE USER'S PUBLIC PROFILE ---
const getSingleUser = async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        // Exclude sensitive information from the public profile
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
    }
    
    res.status(StatusCodes.OK).json({ user });
};

// --- UPDATE USER DETAILS (email, name, bio) ---
const updateUser = async (req, res) => {
    // Note: The ER diagram uses 'username', but we accept 'name' from the request
    // to maintain API consistency with your old project and map it to the 'username' field.
    const { email, name, bio } = req.body;

    if (!email || !name) {
        throw new CustomError.BadRequestError('Please provide both name and email');
    }

    // Find the user by their ID from the token
    const user = await User.findByPk(req.user.userId);

    // Update the fields on the Sequelize instance
    user.email = email;
    user.username = name; // Map 'name' from request to 'username' in DB

    // Only allow bio updates if the user is an artist and a bio is provided
    if (req.user.role === 'artist' && bio !== undefined) {
        user.bio = bio;
    }

    // The 'save' method will persist the changes to the database
    // and will trigger the 'beforeUpdate' hook if the password was also changed.
    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
};


// --- UPDATE USER PASSWORD ---
const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide both old and new passwords');
    }

    // Find the user by their ID from the token
    const user = await User.findByPk(req.user.userId);

    // Check if the old password is correct using the instance method
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Old Password');
    }

    // Set the new password. The 'beforeUpdate' hook in the model will hash it before saving.
    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Success! Password updated.' });
};

/*
// --- HOW TO USE THE STORED PROCEDURE (For Artist Profile Page) ---
// This function would fetch an artist and all their related content (products, blogs, etc.)
// in a single, efficient database call, fulfilling a key project requirement.

const sequelize = require('../db/sequelize');
const { QueryTypes } = require('sequelize');

const getArtistProfile = async (req, res) => {
    const { id: artistId } = req.params;

    const results = await sequelize.query(
        'SELECT get_artist_profile(:artistId)', 
        {
            replacements: { artistId: artistId },
            type: QueryTypes.SELECT,
        }
    );

    // The result from the function is in the first row, under the function's name
    const profileData = results[0]?.get_artist_profile; 

    if (!profileData || !profileData.artist) {
      throw new CustomError.NotFoundError(`No artist with id: ${artistId}`);
    }

    res.status(StatusCodes.OK).json({ profile: profileData });
}
*/

module.exports = {
    showCurrentUser,
    getSingleUser,
    updateUser,
    updateUserPassword,
    getArtistProfile 
    // getArtistProfile // You would export and add this to a route when ready
};