const express = require('express');
const router = express.Router();
const { saveAttempt, getHistory, getSubjectSummary } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/attempt', protect, saveAttempt);
router.get('/history', protect, getHistory);
router.get('/summary', protect, getSubjectSummary);

module.exports = router;