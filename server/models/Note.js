const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: null, // AI ne summary di toh save hogi — warna null
    },
    suggestions: {
      type: [String], // Array of strings — tips ki list
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);
