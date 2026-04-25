const express = require('express');
const { getAllTutors, addTutor } = require('../controllers/tutorController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAllTutors)
  .post(protect, addTutor);

module.exports = router;