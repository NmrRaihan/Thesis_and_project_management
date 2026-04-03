const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup',
    required: true
  },
  field: {
    type: String,
    trim: true
  },
  project_type: {
    type: String,
    enum: ['thesis', 'project', 'research'],
    default: 'thesis'
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  submission_date: {
    type: Date
  },
  review_date: {
    type: Date
  },
  supervisor_comments: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
proposalSchema.index({ group_id: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ field: 1 });
proposalSchema.index({ project_type: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);