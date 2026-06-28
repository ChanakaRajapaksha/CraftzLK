const express = require('express');
const router = express.Router();
const promoDiscountsController = require('../controllers/promoDiscountsController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(promoDiscountsController.list.bind(promoDiscountsController)));
router.get('/:id', asyncHandler(promoDiscountsController.getById.bind(promoDiscountsController)));
router.post('/create', asyncHandler(promoDiscountsController.create.bind(promoDiscountsController)));
router.put('/:id', asyncHandler(promoDiscountsController.update.bind(promoDiscountsController)));
router.delete('/:id', asyncHandler(promoDiscountsController.remove.bind(promoDiscountsController)));

module.exports = router;
