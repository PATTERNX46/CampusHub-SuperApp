const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Service Title (e.g., Expert Electrician)
  category: { type: String, enum: ['Maid', 'Plumber', 'Electrician', 'Cook', 'Other'], required: true },
  experience: { type: String, required: true }, // e.g., "5 Years"
  pricing: { type: Number, required: true }, // e.g., 300 per visit/hour
  pricingType: { type: String, enum: ['Per Hour', 'Per Visit', 'Per Month'], required: true },
  availability: { type: String, required: true }, // e.g., "9 AM - 6 PM"
  image: { type: String }, // Provider's photo or work photo
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);