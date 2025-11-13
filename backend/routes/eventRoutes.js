// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser, authorizePermissions } = require('../middleware/authentication');

const {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyHostedEvents,
  getMyRegisteredEvents,
} = require('../controllers/eventController');

// Routes for getting all events and creating a new one
router.route('/')
  .get(getAllEvents)
  .post([authenticateUser, authorizePermissions('artist')], createEvent);

// Routes for an artist's own hosted events
router.route('/my-hosted')
  .get([authenticateUser, authorizePermissions('artist')], getMyHostedEvents);

// Route for a user's registered events
router.route('/my-registered')
  .get(authenticateUser, getMyRegisteredEvents);

// Routes for a specific event by its ID
router.route('/:id')
  .get(getSingleEvent)
  .patch([authenticateUser, authorizePermissions('artist')], updateEvent)
  .delete([authenticateUser, authorizePermissions('artist')], deleteEvent);

// Route for a user to register for a specific event
router.route('/:id/register')
  .post(authenticateUser, registerForEvent);

module.exports = router;