const express = require('express');
const router = express.Router();
const { scanImageWithGemini } = require('../controllers/ocrController');

router.post('/scan', scanImageWithGemini);

module.exports = router;