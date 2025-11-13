// controllers/eventController.js
const { Event, EventAttendee, User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { Op } = require('sequelize');

// --- CREATE EVENT (Artist Only) ---
const createEvent = async (req, res) => {
    // 1. Basic validation for text fields
    const { title, description, event_date } = req.body;
    if (!title || !description || !event_date) {
        throw new CustomError.BadRequestError('Please provide title, description, and date for the event.');
    }

    // 2. Validate that a file was uploaded under the correct key
    // --- THE FIX IS HERE ---
    if (!req.files || !req.files.eventImage) {
        throw new CustomError.BadRequestError('Please upload an event image.');
    }

    const eventImage = req.files.eventImage;

    // 3. (Optional but recommended) Validate image type
    if (!eventImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('Please upload a valid image file (jpeg, png, etc.).');
    }

    // 4. Upload the image to Cloudinary
    let result;
    try {
        result = await cloudinary.uploader.upload(
            eventImage.tempFilePath,
            {
                use_filename: true,
                folder: 'kalakosha-events-sql', // Organize uploads in a specific folder
            }
        );
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw new CustomError.InternalServerError('Image upload failed');
    } finally {
        // 5. Clean up the temporary file from the server's filesystem in all cases
        fs.unlinkSync(eventImage.tempFilePath);
    }

    // 6. Prepare the final data object for database creation
    const eventData = {
        ...req.body,
        host_id: req.user.userId, // Artist's ID comes from the authenticated user token
        image_url: result.secure_url, // Add the secure image URL from Cloudinary
    };
    
    // 7. Create the event in the database
    const event = await Event.create(eventData);
    res.status(StatusCodes.CREATED).json({ event });
};


// --- GET ALL UPCOMING EVENTS (Public) ---
const getAllEvents = async (req, res) => {
    const events = await Event.findAll({
        where: { event_date: { [Op.gte]: new Date() } },
        order: [['event_date', 'ASC']],
        include: [{ model: User, as: 'host', attributes: ['user_id', 'username'] }]
    });
    res.status(StatusCodes.OK).json({ events, count: events.length });
};



// --- REGISTER FOR AN EVENT (Authenticated Users) ---
const registerForEvent = async (req, res) => {
    const { id: eventId } = req.params;
    const { userId } = req.user;

    const event = await Event.findByPk(eventId);
    if (!event) { throw new CustomError.NotFoundError(`No event with id: ${eventId}`); }

    const [attendee, created] = await EventAttendee.findOrCreate({
        where: { user_id: userId, event_id: eventId },
    });

    if (!created) { return res.status(StatusCodes.OK).json({ msg: 'You are already registered for this event.' }); }

    res.status(StatusCodes.CREATED).json({ msg: 'Successfully registered for the event!' });
};

// --- GET EVENTS HOSTED BY CURRENT ARTIST ---
const getMyHostedEvents = async (req, res) => {
    const events = await Event.findAll({
        where: { host_id: req.user.userId },
        order: [['event_date', 'DESC']]
    });
    res.status(StatusCodes.OK).json({ events, count: events.length });
};

// --- GET EVENTS THE CURRENT USER IS REGISTERED FOR ---
const getMyRegisteredEvents = async (req, res) => {
    const userWithEvents = await User.findByPk(req.user.userId, {
        include: [{
            model: Event,
            as: 'attendedEvents',
            include: [{ model: User, as: 'host', attributes: ['user_id', 'username'] }], // Also include host info
            through: { attributes: [] }
        }],
        order: [[{ model: Event, as: 'attendedEvents' }, 'event_date', 'ASC']]
    });
    const events = userWithEvents ? userWithEvents.attendedEvents : [];
    res.status(StatusCodes.OK).json({ events, count: events.length });
};

// --- UPDATE EVENT (Artist owner only) ---  <- ADD THIS
const updateEvent = async (req, res) => {
    const { id: eventId } = req.params;
    const event = await Event.findByPk(eventId);
    if (!event) {
        throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
    }
    checkPermissions(req.user, event.host_id);
    await event.update(req.body);
    res.status(StatusCodes.OK).json({ event });
};

// --- DELETE EVENT (Artist owner only) ---  <- ADD THIS
const deleteEvent = async (req, res) => {
    const { id: eventId } = req.params;
    const event = await Event.findByPk(eventId);
    if (!event) {
        throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
    }
    checkPermissions(req.user, event.host_id);
    await event.destroy();
    res.status(StatusCodes.OK).json({ msg: 'Success! Event removed.' });
};

const getSingleEvent = async (req, res) => {
    const { id: eventId } = req.params;
    const event = await Event.findByPk(eventId, {
        include: [
            {
                model: User,
                as: 'host',
                attributes: ['user_id', 'username', 'bio']
            },
            {
                model: User, // <-- ADD THIS BLOCK
                as: 'attendees',
                attributes: ['user_id'], // We only need their IDs for the check
                through: { attributes: [] } // Don't include the junction table data
            }
        ]
    });

    if (!event) {
        throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
    }
    res.status(StatusCodes.OK).json({ event });
};
module.exports = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    registerForEvent,
    getMyHostedEvents,
    getMyRegisteredEvents,
    updateEvent,  // <-- ADD TO EXPORTS
    deleteEvent,  // <-- ADD TO EXPORTS
};