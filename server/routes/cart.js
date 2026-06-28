const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(cartController.list.bind(cartController)));
router.post('/add', asyncHandler(cartController.add.bind(cartController)));
router.get('/:id', asyncHandler(cartController.getById.bind(cartController)));
router.put('/:id', asyncHandler(cartController.update.bind(cartController)));
router.delete('/:id', asyncHandler(cartController.remove.bind(cartController)));

module.exports = router;
