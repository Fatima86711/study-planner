// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─── JWT Token Banane Ka Helper Function ──────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// Route:  POST /api/auth/register
// Access: Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation — koi field khali toh nahi?
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // 2. Check — kya yeh email pehle se registered hai?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 3. Naya user banao — password User.js mein khud hash ho jayega
    const user = await User.create({ name, email, password });

    // 4. Token banao aur response bhejo
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Route:  POST /api/auth/login
// Access: Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation — dono fields aaye hain?
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Email se user dhundo database mein
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Password match karo — User.js wala matchPassword method use hoga
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. Token banao aur response bhejo
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
// Route:  GET /api/auth/me
// Access: Private (token chahiye)
const getMe = async (req, res) => {
  try {
    // req.user authMiddleware mein set hoga
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
