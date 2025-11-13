// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust the path to your sequelize instance
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    // Model attributes are defined here, mapping to table columns
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
            msg: 'This username is already taken.'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'An account with this email already exists.'
        },
        validate: {
            isEmail: {
                msg: 'Please provide a valid email address.'
            }
        }
    },
    // The ER diagram has 'password_hash', we'll name the field 'password' for convention
    // but it will always store a hash.
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'customer',
        validate: {
            isIn: [['customer', 'artist', 'admin']]
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true // Bio is optional, especially for customers
    }
}, {
    // Other model options go here
    tableName: 'users',
    timestamps: true, // This will add createdAt and updatedAt fields
    createdAt: 'created_at',
    updatedAt: false, // We only need created_at as per the ER diagram

    // Hooks are functions that run during the model's lifecycle.
    // We use a 'beforeCreate' hook to hash the password automatically.
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
        // Only hash the password if it has been changed
        if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
});

// Instance method to compare passwords during login
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


// Note: Associations (like User.hasMany(Product)) will be defined
// in a central file (e.g., models/index.js) after all models are defined.

module.exports = User;