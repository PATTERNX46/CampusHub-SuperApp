const Product = require('../models/Product');

// @desc    Create a product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  // এখানে image টা যোগ করা হলো
  const { title, description, price, category, courseFilter, condition, image } = req.body;

  try {
    const product = new Product({
      sellerId: req.user._id, 
      title,
      description,
      price,
      category,
      courseFilter,
      condition,
      image // ছবি সেভ হবে
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all products (with optional course filtering)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  const { courseFilter } = req.query;
  
  try {
    const query = courseFilter ? { courseFilter } : {};
    
    // createdAt দিয়ে sort করা হলো যাতে নতুন প্রোডাক্ট আগে দেখায়
    const products = await Product.find(query)
      .populate('sellerId', 'name email phone') 
      .sort('-createdAt'); 

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Product Delete করার ফাংশন
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully by Admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};