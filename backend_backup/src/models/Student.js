const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  department: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  semester: {
    type: Number
  },
  gpa: {
    type: Number
  },
  skills: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  group_id: {
    type: String,
    ref: 'StudentGroup'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  },
  profile_photo: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
studentSchema.index({ student_id: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ group_id: 1 });

module.exports = mongoose.model('Student', studentSchema);