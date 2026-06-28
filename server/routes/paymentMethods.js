const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/methods', asyncHandler(paymentMethodController.getMethods.bind(paymentMethodController)));
router.get('/methods/:id', asyncHandler(paymentMethodController.getMethodById.bind(paymentMethodController)));
router.put('/methods/:id', asyncHandler(paymentMethodController.updateMethod.bind(paymentMethodController)));
router.get('/transactions', asyncHandler(paymentMethodController.getTransactions.bind(paymentMethodController)));

module.exports = router;
