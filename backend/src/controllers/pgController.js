const PgHostel = require('../models/PgHostel');

// ১. সব PG বা হোস্টেল দেখার ফাংশন (সবাই দেখতে পাবে)
exports.getAllPgs = async (req, res) => {
  try {
    // ডাটাবেস থেকে সব পিজি আনবে এবং সাথে মালিকের নামটাও জুড়ে দেবে
    const pgs = await PgHostel.find().populate('ownerId', 'name email phone');
    res.status(200).json(pgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. নতুন PG আপলোড করার ফাংশন (শুধুমাত্র PG Owner-দের জন্য)
exports.addPg = async (req, res) => {
  try {
    const userRole = req.user.roles && req.user.roles.length > 0 ? req.user.roles[0] : (req.user.role || 'user');
    
    // 🛡️ SECURITY CHECK: শুধু 'pg' বা 'admin' রোল থাকলেই ফ্ল্যাট আপলোড করা যাবে
    if (userRole !== 'pg' && userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied. Only PG/Hostel Owners can list properties." });
    }

    const newPg = await PgHostel.create({
      ...req.body,
      ownerId: req.user._id
    });

    res.status(201).json(newPg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🗑️ Admin PG Delete Function
exports.deletePg = async (req, res) => {
  try {
    // নোট: তোমার মডেলের নাম যদি 'PG' হয় তবে 'PG.findById...' লিখবে, আর 'Pg' হলে 'Pg.findById...' লিখবে
    const pg = await Pg.findByIdAndDelete(req.params.id); 
    if (!pg) {
      return res.status(404).json({ message: "PG not found" });
    }
    res.status(200).json({ message: "PG deleted successfully by Admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};