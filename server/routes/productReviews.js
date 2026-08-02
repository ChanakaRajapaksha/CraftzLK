const express = require('express');
const router = express.Router();
const multer = require('multer');
const productReviewController = require('../controllers/productReviewController');
const asyncHandler = require('../middleware/asyncHandler');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads');
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get('/admin/list', asyncHandler(productReviewController.listAdmin.bind(productReviewController)));
router.get('/getall', asyncHandler(productReviewController.getAll.bind(productReviewController)));
router.get('/', asyncHandler(productReviewController.list.bind(productReviewController)));
router.get('/get/count', asyncHandler(productReviewController.getCount.bind(productReviewController)));
router.get('/stats', asyncHandler(productReviewController.getStats.bind(productReviewController)));
router.post(
  '/upload',
  upload.array('images'),
  asyncHandler(productReviewController.upload.bind(productReviewController))
);
router.post('/add', asyncHandler(productReviewController.add.bind(productReviewController)));
router.delete(
  '/deleteImage',
  asyncHandler(productReviewController.deleteImage.bind(productReviewController))
);
router.patch('/:id/approve', asyncHandler(productReviewController.approve.bind(productReviewController)));
router.patch('/:id/reject', asyncHandler(productReviewController.reject.bind(productReviewController)));
router.put('/:id/status', asyncHandler(productReviewController.updateStatus.bind(productReviewController)));
router.get('/:id', asyncHandler(productReviewController.getById.bind(productReviewController)));
router.delete('/:id', asyncHandler(productReviewController.remove.bind(productReviewController)));

module.exports = router;
