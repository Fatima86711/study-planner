const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getWeeklyProgress,
  getWeakSubjects,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboard);
router.get('/weekly', protect, getWeeklyProgress);
router.get('/weak-subjects', protect, getWeakSubjects);

module.exports = router;