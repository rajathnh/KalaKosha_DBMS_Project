// models/eventAttendee.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const EventAttendee = sequelize.define('EventAttendee', {
    attendee_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // The user_id and event_id foreign keys are the core of this model.
    // They will be added automatically by Sequelize when we define
    // the many-to-many relationship.
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'event_attendees',
    timestamps: false, // registration_date serves as the timestamp

    // This index ensures that a user can only register for a specific event once.
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'event_id']
        }
    ]
});

// This model is primarily used as a 'through' table for the many-to-many
// association between User and Event.

module.exports = EventAttendee;