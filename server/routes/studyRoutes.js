const express = require('express');
const router = express.Router();
const { saveSession, getHistory, getTodaySessions } = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/session', protect, saveSession);
router.get('/history', protect, getHistory);
router.get('/today', protect, getTodaySessions);

module.exports = router;