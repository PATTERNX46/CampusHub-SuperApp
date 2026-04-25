const express = require('express');
const router = express.Router();
const { createProduct, getProducts,deleteProduct } = require('../controllers/productController');
const { protect, canSellSecondHand } = require('../middlewares/authMiddleware'); // Check folder name here!

// Get all products doesn't need protection, anyone can view
router.get('/', getProducts);
router.delete('/:id', deleteProduct);

// Creating a product requires the user to be logged in (protect) 
// AND passes through your custom marketplace rules (canSellSecondHand)
router.post('/', protect, canSellSecondHand, createProduct);

module.exports = router;