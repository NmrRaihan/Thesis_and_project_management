const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching students'
    });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ student_id: req.params.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student'
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating student'
    });
  }
};

// @desc    Get available students for invitation
// @route   GET /api/students/available-for-invitation
// @access  Private (student must be authenticated)
const getAvailableStudentsForInvitation = async (req, res) => {
  try {
    // Find the current student to check their group status
    const currentStudent = await Student.findById(req.user.id);
    if (!currentStudent) {
      return res.status(404).json({
        success: false,
        message: 'Current student not found'
      });
    }

    // Check if current student is a group leader
    if (!currentStudent.is_group_admin || !currentStudent.group_id) {
      return res.status(403).json({
        success: false,
        message: 'Only group leaders can invite students'
      });
    }

    // Find students who are not in a group and are active
    const availableStudents = await Student.find({
      _id: { $ne: currentStudent._id }, // Exclude current user
      group_id: { $exists: false, $eq: null }, // Not in a group
      status: 'active'
    }).select('student_id full_name email department profile_photo');

    res.status(200).json({
      success: true,
      count: availableStudents.length,
      students: availableStudents
    });
  } catch (error) {
    console.error('Get available students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available students'
    });
  }
};

// @desc    Student login
// @route   POST /api/students/login
// @access  Public
const loginStudent = async (req, res) => {
  try {
    const { student_id, password } = req.body;
    
    // Validate input
    if (!student_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student ID and password'
      });
    }
    
    // Find student
    console.log('Looking for student with ID:', student_id);
    const student = await Student.findOne({ student_id });
    console.log('Found student:', student ? student.full_name : 'NOT FOUND');
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password (for migrated data, passwords are stored as plain text)
    // In a real app, passwords would be hashed
    let passwordMatch = false;
    
    if (student.password_hash && student.password_hash === password) {
      passwordMatch = true;
    } else if (student.password && student.password === password) {
      passwordMatch = true;
    }
    
    if (!passwordMatch) {
      console.log('Password mismatch. Expected:', password, 'Got hash:', student.password_hash, 'Got password:', student.password);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(student._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        department: student.department,
        year: student.year,
        semester: student.semester,
        gpa: student.gpa,
        group_id: student.group_id,
        is_group_admin: student.is_group_admin,
        group_name: student.group_name,
        profile_photo: student.profile_photo
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  loginStudent,
  getAvailableStudentsForInvitation
};