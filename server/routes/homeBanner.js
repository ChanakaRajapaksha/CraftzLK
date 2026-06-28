const express = require('express');
const router = express.Router();
const multer = require('multer');
const homeBannerController = require('../controllers/homeBannerController');
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

router.post('/upload', upload.array('images'), asyncHandler(homeBannerController.upload.bind(homeBannerController)));
router.get('/', asyncHandler(homeBannerController.list.bind(homeBannerController)));
router.get('/:id', asyncHandler(homeBannerController.getById.bind(homeBannerController)));
router.post('/create', asyncHandler(homeBannerController.create.bind(homeBannerController)));
router.delete('/deleteImage', asyncHandler(homeBannerController.deleteImage.bind(homeBannerController)));
router.delete('/:id', asyncHandler(homeBannerController.remove.bind(homeBannerController)));
router.put('/:id', asyncHandler(homeBannerController.update.bind(homeBannerController)));

module.exports = router;
