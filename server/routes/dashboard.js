const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/overview', asyncHandler(dashboardController.overview.bind(dashboardController)));

module.exports = router;
