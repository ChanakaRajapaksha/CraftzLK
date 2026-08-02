const express = require('express');
const router = express.Router();
const couponsController = require('../controllers/couponsController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(couponsController.list.bind(couponsController)));
router.post('/validate', asyncHandler(couponsController.validate.bind(couponsController)));
router.get('/:id', asyncHandler(couponsController.getById.bind(couponsController)));
router.post('/create', asyncHandler(couponsController.create.bind(couponsController)));
router.put('/:id', asyncHandler(couponsController.update.bind(couponsController)));
router.delete('/:id', asyncHandler(couponsController.remove.bind(couponsController)));

module.exports = router;
