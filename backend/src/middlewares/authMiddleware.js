const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Check if user is logged in
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. [UPDATED] Check if user is a student (Dynamic Check)
exports.studentOnly = (req, res, next) => {
  const roles = req.user.roles || [];
  // স্টুডেন্ট হিসেবে অ্যাক্সেস পেতে হলে roles-এ 'student' থাকতে হবে অথবা isStudent true হতে হবে
  if (roles.includes('student') || req.user.isStudent) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Verified Students only.' });
  }
};

// 3. [UPDATED] Marketplace Role Rules
exports.canSellSecondHand = (req, res, next) => {
  const { condition } = req.body;
  const roles = req.user.roles || [];
  const isStudent = roles.includes('student') || req.user.isStudent;

  // Rule: Second-Hand বা Rent শুধুমাত্র স্টুডেন্টরা বিক্রি করতে পারবে
  if ((condition === 'Second-Hand' || condition === 'Rent') && !isStudent) {
    return res.status(403).json({ message: 'Only Verified Students can sell/rent used products.' });
  }

  // Rule: Shop Owner শুধুমাত্র New জিনিস বিক্রি করতে পারবে (এটি ফ্রন্টএন্ডেও আটকানো আছে)
  if (roles.includes('shop') && condition !== 'New') {
    return res.status(403).json({ message: 'Shop Owners are restricted to NEW items only.' });
  }

  next();
};