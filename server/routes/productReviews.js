const express = require('express');
const router = express.Router();
const productReviewController = require('../controllers/productReviewController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(productReviewController.list.bind(productReviewController)));
router.get('/get/count', asyncHandler(productReviewController.getCount.bind(productReviewController)));
router.get('/:id', asyncHandler(productReviewController.getById.bind(productReviewController)));
router.post('/add', asyncHandler(productReviewController.add.bind(productReviewController)));
router.put('/:id/status', asyncHandler(productReviewController.updateStatus.bind(productReviewController)));
router.delete('/:id', asyncHandler(productReviewController.remove.bind(productReviewController)));

module.exports = router;
