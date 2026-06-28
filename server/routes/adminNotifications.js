const express = require('express');
const router = express.Router();
const adminNotificationsController = require('../controllers/adminNotificationsController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(adminNotificationsController.list.bind(adminNotificationsController)));
router.put('/read-all', asyncHandler(adminNotificationsController.readAll.bind(adminNotificationsController)));
router.put('/:id/read', asyncHandler(adminNotificationsController.markRead.bind(adminNotificationsController)));

module.exports = router;
