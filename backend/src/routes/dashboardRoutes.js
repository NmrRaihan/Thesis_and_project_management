const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllData,
  clearAllData,
  addTeacher
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.get('/stats', protect, getDashboardStats);
router.get('/all-data', protect, getAllData);
router.delete('/clear-all', protect, clearAllData);
router.post('/teachers', protect, addTeacher);

module.exports = router;