const express = require('express');
const router = express.Router();
const multer = require('multer');
const bannerController = require('../controllers/bannerController');
const asyncHandler = require('../middleware/asyncHandler');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.array('images'), asyncHandler(bannerController.upload.bind(bannerController)));
router.get('/', asyncHandler(bannerController.list.bind(bannerController)));
router.get('/:id', asyncHandler(bannerController.getById.bind(bannerController)));
router.post('/create', asyncHandler(bannerController.create.bind(bannerController)));
router.delete('/deleteImage', asyncHandler(bannerController.deleteImage.bind(bannerController)));
router.delete('/:id', asyncHandler(bannerController.remove.bind(bannerController)));
router.put('/:id', asyncHandler(bannerController.update.bind(bannerController)));

module.exports = router;
