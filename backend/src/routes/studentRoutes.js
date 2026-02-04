const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  loginStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', loginStudent);

// Protected routes
router.get('/', protect, getAllStudents);
router.get('/:id', protect, getStudentById);
router.post('/', protect, createStudent);

module.exports = router;