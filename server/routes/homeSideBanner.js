const express = require('express');
const router = express.Router();
const multer = require('multer');
const homeSideBannerController = require('../controllers/homeSideBannerController');
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

router.post('/upload', upload.array('images'), asyncHandler(homeSideBannerController.upload.bind(homeSideBannerController)));
router.get('/', asyncHandler(homeSideBannerController.list.bind(homeSideBannerController)));
router.get('/:id', asyncHandler(homeSideBannerController.getById.bind(homeSideBannerController)));
router.post('/create', asyncHandler(homeSideBannerController.create.bind(homeSideBannerController)));
router.delete('/deleteImage', asyncHandler(homeSideBannerController.deleteImage.bind(homeSideBannerController)));
router.delete('/:id', asyncHandler(homeSideBannerController.remove.bind(homeSideBannerController)));
router.put('/:id', asyncHandler(homeSideBannerController.update.bind(homeSideBannerController)));

module.exports = router;
