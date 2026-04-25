const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  category: { type: String, enum: ['Tech', 'Govt', 'Design', 'Marketing'], required: true },
  duration: { type: String, default: '3 Months' },
  stipend: { type: String, default: 'Negotiable' },
  link: { type: String, required: true }, // 🔗 আসল LinkedIn/Govt লিঙ্ক এখানে থাকবে
  platform: { type: String, default: 'Official Website' }, // e.g. LinkedIn, AICTE
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);