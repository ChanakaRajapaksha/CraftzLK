const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/sales', asyncHandler(reportsController.sales.bind(reportsController)));
router.get('/products', asyncHandler(reportsController.products.bind(reportsController)));
router.get('/customers', asyncHandler(reportsController.customers.bind(reportsController)));

module.exports = router;
