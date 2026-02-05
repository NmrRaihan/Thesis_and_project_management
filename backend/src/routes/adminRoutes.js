const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getAdminProfile,
  createAdmin,
  initializeAdmin
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', loginAdmin);
router.post('/initialize', initializeAdmin);

// Protected routes
router.get('/profile', protect, getAdminProfile);
router.post('/create', protect, createAdmin);

module.exports = router;