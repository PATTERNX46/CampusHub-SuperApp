const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  gender: { type: String },
  password: { type: String, required: true },
  
  // Role System
  isStudent: { type: Boolean, default: false },
  instituteEmail: { type: String }, // Optional, required if student
  
  roles: {
    type: [String], 
    enum: [
      // তোমার আগের রোলগুলো (এগুলো একদম সেম আছে)
      'user', 'seller', 'food_provider', 'service_provider', 'medical', 'pg_owner',
      // 👇 নতুন ইকোসিস্টেমের জন্য যোগ করা রোলগুলো
      'student', 'service', 'shop', 'teacher', 'pg', 'admin'
    ],
    default: ['user']
  },

  // OTP Verification System (তোমার আগের লজিক একদম অক্ষত আছে)
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },

  // 🚀 Admin Control & Notification System (এই দুটো নতুন অ্যাড হলো)
  status: { type: String, default: 'pending' },
  adminMessage: { type: String, default: '' }
  
}, { timestamps: true });

// Hash password before saving to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords during login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);