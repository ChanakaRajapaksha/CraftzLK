const express = require('express');
const router = express.Router();
const compareListController = require('../controllers/compareListController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(compareListController.list.bind(compareListController)));
router.post('/add', asyncHandler(compareListController.add.bind(compareListController)));
router.delete('/:id', asyncHandler(compareListController.remove.bind(compareListController)));
router.get('/:id', asyncHandler(compareListController.getById.bind(compareListController)));

module.exports = router;
