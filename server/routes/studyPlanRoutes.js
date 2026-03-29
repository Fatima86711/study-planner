const express = require('express');
const router = express.Router();
const { savePlan, getMyPlans, completeTask } = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save', protect, savePlan);
router.get('/my-plans', protect, getMyPlans);
router.patch('/:planId/task/:taskId', protect, completeTask);

module.exports = router;