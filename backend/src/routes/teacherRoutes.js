const express = require('express');
const router = express.Router();
const {
  getAllTeachers,
  getTeacherById,
  loginTeacher
} = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', loginTeacher);

// Protected routes
router.get('/', protect, getAllTeachers);
router.get('/:id', protect, getTeacherById);

module.exports = router;