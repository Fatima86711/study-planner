// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── PROTECT MIDDLEWARE ───────────────────────────────────────────────────────
// This function runs before each protected route
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if authorization token exists in header
    // Frontend sends token as: "Bearer eyJhbGci..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]; // Remove "Bearer" and use only token
    }

    // 2. If token is missing
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token found' });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contains the data we set when generating token — { id: userId }

    // 4. Find user by ID in database — exclude password
    const user = await User.findById(decoded.id).select('-password');

    // 5. If user is not found (deleted or invalid)
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // 6. Attach user to request object for controllers
    req.user = user;

    // 7. Continue to next middleware/controller
    next();

  } catch (error) {

    // JWT verification fails if token expired or tampered with
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
