// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;