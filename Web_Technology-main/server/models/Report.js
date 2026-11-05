const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    damageType: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: 'Unknown location'
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);
