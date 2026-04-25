const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOTP } = require('../controllers/authController');

// আগের টেস্ট টুলের ইম্পোর্টগুলো
const sendEmail = require('../utils/sendEmail'); 
const { upload } = require('../utils/cloudinary'); 

// --- Main Auth Routes ---
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);

// --- Test Routes ---
router.post('/test-email', async (req, res) => {
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Test Email from Super App',
      message: 'Hello Rajdeep! Your Node.js email config is working perfectly 🚀'
    });
    res.status(200).json({ message: 'ইমেইল সফলভাবে পাঠানো হয়েছে!' });
  } catch (error) {
    res.status(500).json({ message: 'ইমেইল পাঠাতে সমস্যা হয়েছে', error: error.message });
  }
});

router.post('/test-upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'কোনো ছবি পাওয়া যায়নি!' });
    }
    res.status(200).json({ 
      message: 'ছবি সফলভাবে Cloudinary-তে আপলোড হয়েছে! 🚀',
      imageUrl: req.file.path 
    });
  } catch (error) {
    res.status(500).json({ message: 'আপলোড ফেইল করেছে', error: error.message });
  }
});

module.exports = router;