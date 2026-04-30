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
    // 👇 [NEW LOGIC] Ultimate Global Student Email Verification
    if (roles && roles.includes('student')) {
      const userEmail = email.toLowerCase();
      
      // পৃথিবীর প্রায় সব কলেজ এবং তোমাদের কলেজের সব ডোমেইন লিস্ট
      const validCollegeDomains = [
        '.ac.in',                // ভারতের বেশিরভাগ কলেজ
        '.edu.in',               // ভারতের এডুকেশনাল ইনস্টিটিউট
        '.edu',                  // গ্লোবাল এডুকেশনাল ইনস্টিটিউট
        '.ac.uk',                // ইউকে (UK) এর কলেজ
        '.ac.bd',                // বাংলাদেশের কলেজ
        '.edu.bd',               // বাংলাদেশের এডুকেশনাল ইনস্টিটিউট
        '@rccinstitute.org',     // তোমাদের BCA/BSc ডোমেইন
        '@rccinstitute.org.in',  // তোমাদের অল্টারনেট ডোমেইন
        '@rcciit.org.in'         // 👈 [NEW] তোমাদের CSE/BTech ডোমেইন
      ];
      
      // চেক করছে ইউজারের ইমেইলটা ওপরের লিস্টের কোনো একটার সাথে মিলছে কি না
      const isInstituteEmail = validCollegeDomains.some(domain => userEmail.endsWith(domain));
      
      if (!isInstituteEmail) {
        return res.status(400).json({ 
          message: "Access Denied! Students must use a valid college/institute email ID (e.g., ends with .ac.in, .edu.in, or @rcciit.org.in)" 
        });
      }
    }
    // 👆 [NEW LOGIC ENDS]
    // 👆 [NEW LOGIC ENDS]

    // 🚀🚀🚀 [আমার অ্যাড করা নতুন কোড শুরু] 🚀🚀🚀
    // আগে শুধু email চেক হচ্ছিল, এখন email এবং phone দুটোই চেক হচ্ছে যাতে duplicate না হয়
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
        if (userExists.email === email) return res.status(400).json({ message: 'User with this email already exists' });
        if (userExists.phone === phone) return res.status(400).json({ message: 'User with this phone number already exists' });
        return res.status(400).json({ message: 'User already exists' });
    }
    // 🚀🚀🚀 [আমার অ্যাড করা নতুন কোড শেষ] 🚀🚀🚀

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // ১০ মিনিট ভ্যালিড

    const user = await User.create({
      name, phone, email, password, age, gender, isStudent, instituteEmail, roles,
      otp, otpExpires
    });

   // ইমেইল পাঠানো
  // ইমেইল পাঠানো
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your OTP for Orbito App',
        message: `Your OTP is ${otp}. It will expire in 10 minutes.`
      });
      res.status(201).json({ message: 'OTP sent to email', userId: user._id });
    } catch (err) {
      console.log("🚨 ALARM! NODEMAILER ERROR MESSAGE:", err.message);
      
      // 🚀 ম্যাজিক লাইন: ইমেইল না গেলে ডেটাবেস থেকে ইউজার ডিলিট হয়ে যাবে!
      if (user && user._id) {
          await User.findByIdAndDelete(user._id); 
      }
      
      return res.status(500).json({ message: 'Email could not be sent. Registration cancelled.' });
    }
  } catch (error) {
    // 🚀🚀🚀 [আমার অ্যাড করা নতুন কোড শুরু] 🚀🚀🚀
    // যদি কেউ বাটনে ডাবল ক্লিক করে ফেলে, তাহলে মঙ্গোডিবি যাতে ক্র্যাশ না করে
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Database Error: Duplicate Email or Phone found!' });
    }
    // 🚀🚀🚀 [আমার অ্যাড করা নতুন কোড শেষ] 🚀🚀🚀
    
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