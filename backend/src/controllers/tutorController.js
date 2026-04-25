const Tutor = require('../models/Tutor');

// ১. সব টিচারদের দেখার ফাংশন (স্টুডেন্টরা দেখতে পাবে)
exports.getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().populate('providerId', 'name email phone');
    res.status(200).json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. নতুন টিচার প্রোফাইল তৈরি করার ফাংশন
exports.addTutor = async (req, res) => {
  try {
    const userRole = req.user.roles && req.user.roles.length > 0 ? req.user.roles[0] : (req.user.role || 'user');
    
    // 🛡️ SECURITY CHECK: শুধু 'teacher' বা 'admin' রোল থাকলেই প্রোফাইল বানানো যাবে
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied. Only Verified Teachers/Tutors can create a profile." });
    }

    const newTutor = await Tutor.create({
      ...req.body,
      providerId: req.user._id
    });

    res.status(201).json(newTutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};