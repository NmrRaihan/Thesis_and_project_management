const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({});
    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teachers'
    });
  }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teacher_id: req.params.id });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      success: true,
      teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching teacher'
    });
  }
};

// @desc    Teacher login
// @route   POST /api/teachers/login
// @access  Public
const loginTeacher = async (req, res) => {
  try {
    const { teacher_id, password } = req.body;
    
    // Validate input
    if (!teacher_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide teacher ID and password'
      });
    }
    
    // Find teacher
    const teacher = await Teacher.findOne({ teacher_id });
    
    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password (for migrated data, passwords are stored as plain text)
    // In a real app, passwords would be hashed
    const passwordMatch = teacher.password_hash === password || teacher.password === password;
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(teacher._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      teacher: {
        id: teacher._id,
        teacher_id: teacher.teacher_id,
        full_name: teacher.full_name,
        email: teacher.email,
        department: teacher.department,
        research_field: teacher.research_field,
        publications: teacher.publications,
        max_students: teacher.max_students,
        current_students_count: teacher.current_students_count,
        profile_photo: teacher.profile_photo,
        accepted_topics: teacher.accepted_topics
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  loginTeacher
};