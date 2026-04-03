const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: String,
    required: true
  },
  sender_type: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  receiver_id: {
    type: String,
    required: true
  },
  receiver_type: {
    type: String,
    enum: ['student', 'teacher', 'group', 'admin'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  message_type: {
    type: String,
    enum: ['text', 'file', 'notification'],
    default: 'text'
  },
  file_url: {
    type: String
  },
  file_name: {
    type: String
  },
  is_read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ sender_id: 1, sender_type: 1 });
messageSchema.index({ receiver_id: 1, receiver_type: 1 });
messageSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);