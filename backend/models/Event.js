// models/event.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust path as needed

const Event = sequelize.define('Event', {
    event_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    event_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // The host_id foreign key will be added via association with the User model.
}, {
    tableName: 'events',
    timestamps: false, // The event_date serves as the primary timestamp
});

// Associations for this model will be defined in a central file.
// - Event.belongsTo(User, { as: 'host' })
// - Event.belongsToMany(User, { through: EventAttendee, as: 'attendees' })

module.exports = Event;