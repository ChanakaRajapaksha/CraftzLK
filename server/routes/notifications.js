const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/settings', asyncHandler(notificationController.getSettings.bind(notificationController)));
router.put('/settings', asyncHandler(notificationController.updateSettings.bind(notificationController)));
router.get('/templates', asyncHandler(notificationController.getTemplates.bind(notificationController)));
router.get('/templates/:id', asyncHandler(notificationController.getTemplateById.bind(notificationController)));
router.put('/templates/:id', asyncHandler(notificationController.updateTemplate.bind(notificationController)));

module.exports = router;
