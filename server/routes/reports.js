const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/sales', asyncHandler(reportsController.sales.bind(reportsController)));
router.get('/products', asyncHandler(reportsController.products.bind(reportsController)));
router.get('/customers', asyncHandler(reportsController.customers.bind(reportsController)));
router.get('/payments', asyncHandler(reportsController.payments.bind(reportsController)));
router.get('/inventory', asyncHandler(reportsController.inventory.bind(reportsController)));
router.get('/coupons', asyncHandler(reportsController.coupons.bind(reportsController)));
router.get('/orders', asyncHandler(reportsController.orders.bind(reportsController)));
router.get('/:type/export', asyncHandler(reportsController.export.bind(reportsController)));

module.exports = router;
