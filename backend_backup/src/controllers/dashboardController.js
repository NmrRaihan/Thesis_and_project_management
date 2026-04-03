const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentGroup = require('../models/StudentGroup');
const Proposal = require('../models/Proposal');
const Message = require('../models/Message');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const SharedFile = require('../models/SharedFile');
const WeeklyProgress = require('../models/WeeklyProgress');
const GroupInvitation = require('../models/GroupInvitation');
const SupervisionRequest = require('../models/SupervisionRequest');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all entities
    const [
      studentsCount,
      teachersCount,
      groupsCount,
      proposalsCount,
      messagesCount,
      meetingsCount,
      tasksCount,
      filesCount,
      progressReportsCount,
      invitationsCount,
      supervisionRequestsCount
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      StudentGroup.countDocuments(),
      Proposal.countDocuments(),
      Message.countDocuments(),
      Meeting.countDocuments(),
      Task.countDocuments(),
      SharedFile.countDocuments(),
      WeeklyProgress.countDocuments(),
      GroupInvitation.countDocuments(),
      SupervisionRequest.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        students: studentsCount,
        teachers: teachersCount,
        groups: groupsCount,
        proposals: proposalsCount,
        messages: messagesCount,
        meetings: meetingsCount,
        tasks: tasksCount,
        files: filesCount,
        progressReports: progressReportsCount,
        invitations: invitationsCount,
        supervisionRequests: supervisionRequestsCount
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
};

// @desc    Get all entities data
// @route   GET /api/dashboard/all-data
// @access  Private
const getAllData = async (req, res) => {
  try {
    // Get all data from all collections
    const [
      students,
      teachers,
      groups,
      proposals,
      messages,
      meetings,
      tasks,
      files,
      progressReports,
      invitations,
      supervisionRequests
    ] = await Promise.all([
      Student.find({}),
      Teacher.find({}),
      StudentGroup.find({}),
      Proposal.find({}),
      Message.find({}),
      Meeting.find({}),
      Task.find({}),
      SharedFile.find({}),
      WeeklyProgress.find({}),
      GroupInvitation.find({}),
      SupervisionRequest.find({})
    ]);

    res.status(200).json({
      success: true,
      data: {
        students,
        teachers,
        groups,
        proposals,
        messages,
        meetings,
        tasks,
        files,
        progressReports,
        invitations,
        supervisionRequests
      }
    });
  } catch (error) {
    console.error('Get all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching all data'
    });
  }
};

// @desc    Clear all data
// @route   DELETE /api/dashboard/clear-all
// @access  Private
const clearAllData = async (req, res) => {
  try {
    // Clear all collections except Admin
    await Promise.all([
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      StudentGroup.deleteMany({}),
      Proposal.deleteMany({}),
      Message.deleteMany({}),
      Meeting.deleteMany({}),
      Task.deleteMany({}),
      SharedFile.deleteMany({}),
      WeeklyProgress.deleteMany({}),
      GroupInvitation.deleteMany({}),
      SupervisionRequest.deleteMany({})
    ]);

    res.status(200).json({
      success: true,
      message: 'All data cleared successfully'
    });
  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing data'
    });
  }
};

// @desc    Add new teacher
// @route   POST /api/dashboard/teachers
// @access  Private
const addTeacher = async (req, res) => {
  try {
    const {
      teacher_id,
      full_name,
      email,
      password_hash,
      department,
      research_field,
      max_students = 10
    } = req.body;

    // Validate required fields
    if (!teacher_id || !full_name || !email || !password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: teacher_id, full_name, email, password_hash'
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({
      $or: [{ teacher_id }, { email }]
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this ID or email already exists'
      });
    }

    // Create teacher
    const teacher = await Teacher.create({
      teacher_id,
      full_name,
      email,
      password_hash,
      department: department || '',
      research_field: research_field || '',
      max_students,
      current_students_count: 0,
      profile_photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}`,
      acceptance_criteria: 'To be updated',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully',
      teacher
    });
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding teacher'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllData,
  clearAllData,
  addTeacher
};