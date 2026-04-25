const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // যেমন: Electronics, Books, Cycle
  condition: { type: String, required: true }, // New, Second-Hand, Rent
  courseFilter: { type: String }, // BCA, BBA, BTech (Optional)
  image: { type: String, required: true }, // Cloudinary Image URL
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);