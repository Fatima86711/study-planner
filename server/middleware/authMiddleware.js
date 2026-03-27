// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── PROTECT MIDDLEWARE ───────────────────────────────────────────────────────
// Yeh function har protected route ke aage lagega
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check karo — request header mein token hai?
    // Frontend token is format mein bhejta hai: "Bearer eyJhbGci..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]; // "Bearer" hata ke sirf token lo
    }

    // 2. Agar token hai hi nahi
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token found' });
    }

    // 3. Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded mein woh data hoga jo humne token banate waqt daala tha — { id: userId }

    // 4. Us ID se user dhundo database mein — password mat lo
    const user = await User.findById(decoded.id).select('-password');

    // 5. Agar user database mein nahi mila (delete ho gaya ho shayad)
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // 6. User ko request object mein daal do — aage controllers mein kaam aayega
    req.user = user;

    // 7. Aage jane do — next middleware ya controller ki taraf
    next();

  } catch (error) {

    // JWT verify fail hoga agar token expired ho ya tamper kiya gaya ho
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { protect };
