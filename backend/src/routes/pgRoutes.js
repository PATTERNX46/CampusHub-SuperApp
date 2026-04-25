const express = require('express');
const { getAllPgs, addPg,deletePg } = require('../controllers/pgController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// পিজি দেখতে এবং আপলোড করতে অবশ্যই লগইন থাকতে হবে (protect)
router.route('/')
  .get(protect, getAllPgs)
  .post(protect, addPg);
  router.delete('/:id', deletePg);

module.exports = router;