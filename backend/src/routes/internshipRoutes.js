const express = require('express');
const router = express.Router();
const { getInternships, createInternship } = require('../controllers/internshipController');

router.get('/', getInternships);
router.post('/', createInternship);

module.exports = router;