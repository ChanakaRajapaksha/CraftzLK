const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/stock', asyncHandler(inventoryController.getStock.bind(inventoryController)));
router.get('/adjustments', asyncHandler(inventoryController.getAdjustments.bind(inventoryController)));
router.post('/adjust', asyncHandler(inventoryController.adjust.bind(inventoryController)));

module.exports = router;
