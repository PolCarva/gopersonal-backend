const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bio: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    },
    birthdate: {
      type: Date
    },
    preferences: {
      favoriteCategories: [String],
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Profile', ProfileSchema); 