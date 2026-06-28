const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/get-hash', asyncHandler(paymentController.getHash.bind(paymentController)));
router.post('/notify', asyncHandler(paymentController.notify.bind(paymentController)));

module.exports = router;
