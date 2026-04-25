require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const pgRoutes = require('./routes/pgRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// --- Middleware ---
app.use(cors());

// 🚨 [FIXED]: 413 Payload Too Large Error সলভ করার জন্য 50mb লিমিট দেওয়া হলো!
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/admin', adminRoutes);

// Inline Required Routes
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/ocr', require('./routes/ocrRoutes')); 

// Basic route to test if server is running
app.get('/', (req, res) => {
  res.send('Super App Backend is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});