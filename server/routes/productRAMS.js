const express = require('express');
const router = express.Router();
const productRAMSController = require('../controllers/productRAMSController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(productRAMSController.list.bind(productRAMSController)));
router.get('/:id', asyncHandler(productRAMSController.getById.bind(productRAMSController)));
router.post('/create', asyncHandler(productRAMSController.create.bind(productRAMSController)));
router.delete('/:id', asyncHandler(productRAMSController.remove.bind(productRAMSController)));
router.put('/:id', asyncHandler(productRAMSController.update.bind(productRAMSController)));

module.exports = router;
