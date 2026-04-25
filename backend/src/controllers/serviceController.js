const Service = require('../models/Service');

// ১. সব সার্ভিস দেখার ফাংশন (সবাই দেখতে পাবে)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('providerId', 'name email phone');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ২. নতুন সার্ভিস আপলোড করার ফাংশন (শুধুমাত্র Service Provider-দের জন্য)
exports.addService = async (req, res) => {
  try {
    const userRole = req.user.roles && req.user.roles.length > 0 ? req.user.roles[0] : (req.user.role || 'user');
    
    // 🛡️ SECURITY CHECK: শুধু 'service' বা 'admin' রোল থাকলেই সার্ভিস আপলোড করা যাবে
    if (userRole !== 'service' && userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied. Only Verified Service Providers can list services." });
    }

    const newService = await Service.create({
      ...req.body,
      providerId: req.user._id
    });

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🗑️ Admin Service Delete Function
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully by Admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};