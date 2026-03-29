const express = require('express')
const router = express.Router()
const { generateQuiz, generatePlan } = require('../controllers/aiController')
const { protect } = require('../middleware/authMiddleware')

router.post('/quiz', protect, generateQuiz)
router.post('/plan', protect, generatePlan)

module.exports = router