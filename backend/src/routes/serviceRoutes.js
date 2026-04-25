const express = require('express');
const { getAllServices, addService,deleteService } = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getAllServices)
  .post(protect, addService);
router.delete('/:id', deleteService);
module.exports = router;