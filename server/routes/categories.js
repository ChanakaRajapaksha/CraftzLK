const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureUploadsDir } = require('../utils/uploadDir');
const categoryController = require('../controllers/categoryController');
const asyncHandler = require('../middleware/asyncHandler');

const uploadsDir = ensureUploadsDir();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  },
});

router.post('/upload', (req, res) => {
  upload.array('images')(req, res, (uploadError) => {
    categoryController.upload(req, res, uploadError);
  });
});

router.get('/admin/list', asyncHandler(categoryController.adminList.bind(categoryController)));
router.get('/active', asyncHandler(categoryController.listActive.bind(categoryController)));
router.get('/', asyncHandler(categoryController.list.bind(categoryController)));
router.get('/get/count', asyncHandler(categoryController.getCount.bind(categoryController)));
router.get('/subCat/get/count', asyncHandler(categoryController.getSubCatCount.bind(categoryController)));
router.get('/:id', asyncHandler(categoryController.getById.bind(categoryController)));
router.post('/create', asyncHandler(categoryController.create.bind(categoryController)));
router.delete('/deleteImage', asyncHandler(categoryController.deleteImage.bind(categoryController)));
router.delete('/:id', asyncHandler(categoryController.remove.bind(categoryController)));
router.put('/:id', asyncHandler(categoryController.update.bind(categoryController)));

module.exports = router;
