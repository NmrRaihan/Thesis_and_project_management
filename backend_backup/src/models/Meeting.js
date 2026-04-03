const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meeting_id: {
    type: String,
    required: true,
    unique: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup',
    required: true
  },
  supervisor_id: {
    type: String,
    ref: 'Teacher',
    required: true
  },
  meeting_date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  agenda: {
    type: String
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
meetingSchema.index({ group_id: 1 });
meetingSchema.index({ supervisor_id: 1 });
meetingSchema.index({ meeting_date: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);