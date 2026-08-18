const express = require('express');
const router = express.Router();
const productQuestionController = require('../controllers/productQuestionController');
const asyncHandler = require('../middleware/asyncHandler');

router.get(
  '/admin/list',
  asyncHandler(productQuestionController.listAdmin.bind(productQuestionController))
);
router.get(
  '/',
  asyncHandler(productQuestionController.listStorefront.bind(productQuestionController))
);
router.post('/add', asyncHandler(productQuestionController.add.bind(productQuestionController)));
router.patch(
  '/:id/answer',
  asyncHandler(productQuestionController.saveAnswer.bind(productQuestionController))
);
router.patch(
  '/:id/approve',
  asyncHandler(productQuestionController.approveAnswer.bind(productQuestionController))
);
router.get('/:id', asyncHandler(productQuestionController.getById.bind(productQuestionController)));
router.delete('/:id', asyncHandler(productQuestionController.remove.bind(productQuestionController)));

module.exports = router;
