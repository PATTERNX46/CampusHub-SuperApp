const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const twilio = require('twilio'); // 🚀 Twilio ইমপোর্ট করা হলো

// Twilio Setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// টোকেন বানানোর ফাংশন
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ১. Register User
exports.registerUser = async (req, res) => {
  // 🚀 otpMethod রিসিভ করা হচ্ছে ফ্রন্টএন্ড থেকে ('phone' অথবা 'email')
  const { name, phone, email, password, age, gender, isStudent, instituteEmail, roles, otpMethod } = req.body;

  try {
    // 👇 [OLD LOGIC] Strict Student Email Verification (তোমার আগের কোড একদম সেম আছে)
    if (roles && roles.includes('student')) {
      const userEmail = email.toLowerCase();
      const validCollegeDomains = [
        '.ac.in', '.edu.in', '.edu', '.ac.uk', '.ac.bd', '.edu.bd',
        '@rccinstitute.org', '@rccinstitute.org.in', '@rcciit.org.in' 
      ];
      const isInstituteEmail = validCollegeDomains.some(domain => userEmail.endsWith(domain));
      if (!isInstituteEmail) {
        return res.status(400).json({ message: "Access Denied! Students must use a valid college/institute email ID" });
      }
    }
    // 👆 [OLD LOGIC ENDS]

    // 🚀🚀🚀 [ডুপ্লিকেট চেকিং - তোমার আগের কোড সেম আছে] 🚀🚀🚀
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
        if (userExists.email === email) return res.status(400).json({ message: 'User with this email already exists' });
        if (userExists.phone === phone) return res.status(400).json({ message: 'User with this phone number already exists' });
        return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // ১০ মিনিট ভ্যালিড

    const user = await User.create({
      name, phone, email, password, age, gender, isStudent, instituteEmail, roles,
      otp, otpExpires
    });

    try {
      // 🚀🚀🚀 [NEW LOGIC: Twilio vs Brevo Choice] 🚀🚀🚀
      if (otpMethod === 'phone') {
        // Twilio দিয়ে SMS পাঠানো
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        await twilioClient.messages.create({
          body: `Your Orbito App OTP is ${otp}. It will expire in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
        res.status(201).json({ message: 'OTP sent to phone via Twilio', userId: user._id });
      } else {
        // Brevo দিয়ে ইমেইল পাঠানো
        await sendEmail({
          email: user.email,
          subject: 'Your OTP for Orbito App',
          message: `Your OTP is ${otp}. It will expire in 10 minutes.`
        });
        res.status(201).json({ message: 'OTP sent to email via Brevo', userId: user._id });
      }
    } catch (err) {
      console.log("🚨 ALARM! OTP SENDING ERROR MESSAGE:", err.message);
      
      // 🚀 ইমেইল/SMS না গেলে ডেটাবেস থেকে ইউজার ডিলিট হয়ে যাবে!
      if (user && user._id) {
          await User.findByIdAndDelete(user._id); 
      }
      return res.status(500).json({ message: 'OTP could not be sent. Registration cancelled.' });
    }
  } catch (error) {
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Database Error: Duplicate Email or Phone found!' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ২. Verify OTP (🚀 অনেক সহজ হয়ে গেল)
exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 🚀 যেহেতু এখন সব OTP (Phone + Email) আমাদের ডেটাবেসেই সেভ হচ্ছে, তাই Firebase-এর কোনো কন্ডিশন আর লাগবে না!
    if (user.otp !== otp || user.otpExpires < Date.now()) {
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
      adminMessage: user.adminMessage,
      token: generateToken(user._id),
      message: 'Account verified successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ৩. Login User (তোমার আগের কোড সেম আছে)
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
        adminMessage: user.adminMessage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};