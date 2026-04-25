const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    foodSource: { type: String, enum: ['Home', 'Restaurant'], default: 'Home' },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  mealType: { type: String, required: true },
  preOrderTime: { type: String, required: true },
  deliveryArea: { type: String, required: true },
  sellerPhone: { type: String, required: true },
  image: { type: String },
  sellerName: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);