const express = require('express');
const router = express.Router();
const shippingMethodsController = require('../controllers/shippingMethodsController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(shippingMethodsController.list.bind(shippingMethodsController)));
router.get('/active', asyncHandler(shippingMethodsController.listActive.bind(shippingMethodsController)));
router.get('/:id', asyncHandler(shippingMethodsController.getById.bind(shippingMethodsController)));
router.post('/create', asyncHandler(shippingMethodsController.create.bind(shippingMethodsController)));
router.put('/:id', asyncHandler(shippingMethodsController.update.bind(shippingMethodsController)));
router.delete('/:id', asyncHandler(shippingMethodsController.remove.bind(shippingMethodsController)));

module.exports = router;
