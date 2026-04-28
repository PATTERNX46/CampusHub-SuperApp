const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

// টোকেন বানানোর ফাংশন
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ১. Register User
exports.registerUser = async (req, res) => {
  const { name, phone, email, password, age, gender, isStudent, instituteEmail, roles } = req.body;

  try {
    // 👇 [NEW LOGIC] Strict Student Email Verification
    if (roles && roles.includes('student')) {
      const isInstituteEmail = email.endsWith('.edu') || email.endsWith('.ac.in') || email.includes('institute') || email.includes('rcciit');
      if (!isInstituteEmail) {
        return res.status(400).json({ message: "Students must use a verified institute email ID (e.g. @rccinstitute.org)" });
      }
    }
    // 👆 [NEW LOGIC ENDS]

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // ১০ মিনিট ভ্যালিড

    const user = await User.create({
      name, phone, email, password, age, gender, isStudent, instituteEmail, roles,
      otp, otpExpires
    });

    // ইমেইল পাঠানো
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your OTP for Orbito  App',
        message: `Your OTP is ${otp}. It will expire in 10 minutes.`
      });
      res.status(201).json({ message: 'OTP sent to email', userId: user._id });
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. Verify OTP
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isStudent: user.isStudent,
      roles: user.roles,
      adminMessage: user.adminMessage, // 🚀 এখানে অ্যাড করা হলো
      token: generateToken(user._id),
      message: 'Email verified successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isStudent: user.isStudent,
        instituteEmail: user.instituteEmail,
        roles: user.roles,
        adminMessage: user.adminMessage, // 🚀 এখানেও অ্যাড করা হলো
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};