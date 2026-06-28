const express = require('express');
const router = express.Router();
const myListController = require('../controllers/myListController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(myListController.list.bind(myListController)));
router.post('/add', asyncHandler(myListController.add.bind(myListController)));
router.delete('/:id', asyncHandler(myListController.remove.bind(myListController)));
router.get('/:id', asyncHandler(myListController.getById.bind(myListController)));

module.exports = router;
