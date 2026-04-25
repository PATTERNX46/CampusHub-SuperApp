const express = require('express');
const { getAllUsers, updateUserStatus } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🛡️ মিডলওয়্যার যা চেক করবে ইউজার অ্যাডমিন কি না
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || (req.user.roles && req.user.roles.includes('admin')))) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

router.get('/users', protect, adminOnly, getAllUsers);
router.patch('/update-user', protect, adminOnly, updateUserStatus);

module.exports = router;