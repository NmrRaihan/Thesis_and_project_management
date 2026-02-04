const mongoose = require('mongoose');

const weeklyProgressSchema = new mongoose.Schema({
  progress_id: {
    type: String,
    required: true,
    unique: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup',
    required: true
  },
  week_number: {
    type: Number,
    required: true
  },
  work_done: {
    type: String,
    required: true
  },
  challenges: {
    type: String
  },
  next_week_plan: {
    type: String
  },
  supervisor_comments: {
    type: String
  },
  submitted_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
weeklyProgressSchema.index({ group_id: 1 });
weeklyProgressSchema.index({ week_number: 1 });

module.exports = mongoose.model('WeeklyProgress', weeklyProgressSchema);