const express = require('express');
const router = express.Router();
const multer = require('multer');
const homeBottomBannerController = require('../controllers/homeBottomBannerController');
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

router.post('/upload', upload.array('images'), asyncHandler(homeBottomBannerController.upload.bind(homeBottomBannerController)));
router.get('/', asyncHandler(homeBottomBannerController.list.bind(homeBottomBannerController)));
router.get('/:id', asyncHandler(homeBottomBannerController.getById.bind(homeBottomBannerController)));
router.post('/create', asyncHandler(homeBottomBannerController.create.bind(homeBottomBannerController)));
router.delete('/deleteImage', asyncHandler(homeBottomBannerController.deleteImage.bind(homeBottomBannerController)));
router.delete('/:id', asyncHandler(homeBottomBannerController.remove.bind(homeBottomBannerController)));
router.put('/:id', asyncHandler(homeBottomBannerController.update.bind(homeBottomBannerController)));

module.exports = router;
