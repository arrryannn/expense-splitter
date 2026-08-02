const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['Trip', 'Home', 'Couple', 'Other'],
      default: 'Other'
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Group', groupSchema);