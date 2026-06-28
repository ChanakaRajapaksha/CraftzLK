const express = require('express');
const router = express.Router();
const productWeightController = require('../controllers/productWeightController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(productWeightController.list.bind(productWeightController)));
router.get('/:id', asyncHandler(productWeightController.getById.bind(productWeightController)));
router.post('/create', asyncHandler(productWeightController.create.bind(productWeightController)));
router.delete('/:id', asyncHandler(productWeightController.remove.bind(productWeightController)));
router.put('/:id', asyncHandler(productWeightController.update.bind(productWeightController)));

module.exports = router;
