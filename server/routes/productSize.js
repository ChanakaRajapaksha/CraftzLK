const express = require('express');
const router = express.Router();
const productSizeController = require('../controllers/productSizeController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(productSizeController.list.bind(productSizeController)));
router.get('/:id', asyncHandler(productSizeController.getById.bind(productSizeController)));
router.post('/create', asyncHandler(productSizeController.create.bind(productSizeController)));
router.delete('/:id', asyncHandler(productSizeController.remove.bind(productSizeController)));
router.put('/:id', asyncHandler(productSizeController.update.bind(productSizeController)));

module.exports = router;
