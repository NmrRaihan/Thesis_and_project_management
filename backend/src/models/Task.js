const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task_id: {
    type: String,
    required: true,
    unique: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  assigned_to: [{
    student_id: String,
    full_name: String
  }],
  due_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  created_by: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taskSchema.index({ group_id: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ due_date: 1 });

module.exports = mongoose.model('Task', taskSchema);