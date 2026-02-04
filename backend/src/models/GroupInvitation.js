const mongoose = require('mongoose');

const groupInvitationSchema = new mongoose.Schema({
  invitation_id: {
    type: String,
    required: true,
    unique: true
  },
  from_student_id: {
    type: String,
    ref: 'Student',
    required: true
  },
  to_student_id: {
    type: String,
    ref: 'Student',
    required: true
  },
  group_id: {
    type: String,
    ref: 'StudentGroup'
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  sent_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
groupInvitationSchema.index({ from_student_id: 1 });
groupInvitationSchema.index({ to_student_id: 1 });
groupInvitationSchema.index({ status: 1 });

module.exports = mongoose.model('GroupInvitation', groupInvitationSchema);