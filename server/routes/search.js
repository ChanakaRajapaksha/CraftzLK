const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(searchController.search.bind(searchController)));

module.exports = router;
