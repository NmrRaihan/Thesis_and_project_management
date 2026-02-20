const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  loginStudent,
  getAvailableStudentsForInvitation
} = require('../controllers/studentController');
const { protect, protectStudent } = require('../middleware/auth');

// Public routes
router.post('/login', loginStudent);
router.post('/', createStudent); // Student registration should be public

// Protected routes
router.get('/', protect, getAllStudents);
router.get('/:id', protect, getStudentById);

// Student-protected routes (for authenticated students)
router.get('/available-for-invitation', protectStudent, getAvailableStudentsForInvitation);

module.exports = router;