const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(customerController.list.bind(customerController)));
router.get('/get/count', asyncHandler(customerController.getCount.bind(customerController)));
router.get('/:id', asyncHandler(customerController.getById.bind(customerController)));
router.put('/:id/status', asyncHandler(customerController.updateStatus.bind(customerController)));

module.exports = router;
