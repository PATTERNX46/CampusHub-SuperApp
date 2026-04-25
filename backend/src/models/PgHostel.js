const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }, // যেমন: "Boys Hostel near RCCIIT"
  description: { type: String, required: true },
  rent: { type: Number, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Boys', 'Girls', 'Co-ed', 'Flat'], required: true },
  facilities: [{ type: String }], // যেমন: ['WiFi', 'AC', 'Food']
  image: { type: String, required: true },
  contactNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PgHostel', pgSchema);