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
  loginStudent
};