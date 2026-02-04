const mongoose = require('mongoose');

const supervisionRequestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup',
    required: true
  },
  teacher_id: {
    type: String,
    ref: 'Teacher',
    required: true
  },
  request_message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requested_date: {
    type: Date,
    default: Date.now
  },
  response_date: {
    type: Date
  },
  response_message: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
supervisionRequestSchema.index({ group_id: 1 });
supervisionRequestSchema.index({ teacher_id: 1 });
supervisionRequestSchema.index({ status: 1 });

module.exports = mongoose.model('SupervisionRequest', supervisionRequestSchema);