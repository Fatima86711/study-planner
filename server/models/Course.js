const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    subject: {
      type: String,
      enum: ['Science', 'Arts', 'Commerce', 'Technology', 'Language', 'Other'],
      default: 'Other',
    },
    color: {
      type: String,
      default: '#4F46E5',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);