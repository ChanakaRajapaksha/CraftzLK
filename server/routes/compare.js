const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/compare-products', asyncHandler(compareController.compareProducts.bind(compareController)));

module.exports = router;
