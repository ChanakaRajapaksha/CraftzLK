const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/sales', asyncHandler(orderController.getSales.bind(orderController)));
router.get('/get/count', asyncHandler(orderController.getCount.bind(orderController)));
router.get('/', asyncHandler(orderController.list.bind(orderController)));
router.get('/:id', asyncHandler(orderController.getById.bind(orderController)));
router.post('/create', asyncHandler(orderController.create.bind(orderController)));
router.delete('/:id', asyncHandler(orderController.remove.bind(orderController)));
router.put('/:id', asyncHandler(orderController.update.bind(orderController)));

module.exports = router;
