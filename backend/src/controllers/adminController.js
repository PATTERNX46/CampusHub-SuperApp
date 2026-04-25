const User = require('../models/User');

// ১. সব ইউজারদের লিস্ট দেখা
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // পাসওয়ার্ড বাদে সব ডাটা
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. ইউজারের স্ট্যাটাস আপডেট করা (Verify বা Block করা এবং মেসেজ পাঠানো)
exports.updateUserStatus = async (req, res) => {
  try {
    // 🚀 এখানে ফ্রন্টএন্ড থেকে adminMessage টা রিসিভ করা হচ্ছে
    const { userId, isVerified, status, adminMessage } = req.body; 
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { isVerified, status, adminMessage }, // 🚀 ডাটাবেসে মেসেজটা সেভ করা হচ্ছে
      { new: true }
    );
    
    res.status(200).json({ message: "User status and message updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};