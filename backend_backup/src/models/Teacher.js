const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacher_id: {
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
  research_field: {
    type: String,
    trim: true
  },
  publications: [{
    title: String,
    year: Number,
    journal: String
  }],
  max_students: {
    type: Number,
    default: 10
  },
  current_students_count: {
    type: Number,
    default: 0
  },
  profile_photo: {
    type: String
  },
  acceptance_criteria: {
    type: String
  },
  accepted_topics: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
teacherSchema.index({ teacher_id: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ research_field: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);