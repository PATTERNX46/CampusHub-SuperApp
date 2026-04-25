const Internship = require('../models/Internship');

// সব ইন্টার্নশিপ নিয়ে আসার জন্য
exports.getInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// নতুন ইন্টার্নশিপ অ্যাড করার জন্য (অ্যাডমিনদের জন্য)
exports.createInternship = async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};