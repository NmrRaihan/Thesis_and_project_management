const mongoose = require('mongoose');

const sharedFileSchema = new mongoose.Schema({
  file_id: {
    type: String,
    required: true,
    unique: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup',
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  file_type: {
    type: String
  },
  file_size: {
    type: Number
  },
  uploaded_by: {
    type: String,
    required: true
  },
  uploader_name: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
sharedFileSchema.index({ group_id: 1 });
sharedFileSchema.index({ uploaded_by: 1 });

module.exports = mongoose.model('SharedFile', sharedFileSchema);