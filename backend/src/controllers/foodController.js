const Food = require('../models/Food');

exports.createFood = async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🗑️ Delete Food Listing
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food item not found" });
    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};