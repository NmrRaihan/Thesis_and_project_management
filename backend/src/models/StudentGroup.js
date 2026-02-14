const mongoose = require('mongoose');

const studentGroupSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  group_name: {
    type: String,
    required: true,
    trim: true
  },
  leader_student_id: {
    type: String,
    required: true,
    ref: 'Student'
  },
  members: [{
    student_id: {
      type: String,
      ref: 'Student'
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    }
  }],
  supervisor_id: {
    type: String,
    ref: 'Teacher'
  },
  project_title: {
    type: String,
    trim: true
  },
  project_description: {
    type: String
  },
  status: {
    type: String,
    enum: ['forming', 'active', 'completed', 'dissolved'],
    default: 'forming'
  },
  created_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
studentGroupSchema.index({ group_id: 1 });
studentGroupSchema.index({ leader_student_id: 1 });
studentGroupSchema.index({ supervisor_id: 1 });
studentGroupSchema.index({ status: 1 });

module.exports = mongoose.model('StudentGroup', studentGroupSchema);