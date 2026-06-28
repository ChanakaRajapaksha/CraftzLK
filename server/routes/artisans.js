const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureUploadsDir } = require('../utils/uploadDir');
const artisanController = require('../controllers/artisanController');
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
    artisanController.upload(req, res, uploadError);
  });
});

router.get('/admin/list', asyncHandler(artisanController.adminList.bind(artisanController)));
router.get('/', asyncHandler(artisanController.list.bind(artisanController)));
router.get('/get/count', asyncHandler(artisanController.getCount.bind(artisanController)));
router.get('/:id', asyncHandler(artisanController.getById.bind(artisanController)));
router.post('/create', asyncHandler(artisanController.create.bind(artisanController)));
router.delete('/deleteImage', asyncHandler(artisanController.deleteImage.bind(artisanController)));
router.delete('/:id', asyncHandler(artisanController.remove.bind(artisanController)));
router.put('/:id', asyncHandler(artisanController.update.bind(artisanController)));

module.exports = router;
