const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Tutor's Name
  subjects: [{ type: String, required: true }], // e.g., ['Math', 'Physics', 'ReactJS']
  mode: { type: String, enum: ['Online', 'Offline', 'Both'], required: true },
  experience: { type: String, required: true }, // e.g., "3 Years"
  pricing: { type: Number, required: true },
  pricingType: { type: String, enum: ['Per Hour', 'Per Month', 'Per Course'], required: true },
  availability: { type: String, required: true }, // e.g., "Weekends 6PM - 9PM"
  image: { type: String }, // Profile picture
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Tutor', tutorSchema);