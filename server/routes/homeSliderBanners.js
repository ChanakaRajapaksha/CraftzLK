const express = require('express');
const router = express.Router();
const multer = require('multer');
const homeSliderBannersController = require('../controllers/homeSliderBannersController');
const asyncHandler = require('../middleware/asyncHandler');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.array('images'), asyncHandler(homeSliderBannersController.upload.bind(homeSliderBannersController)));
router.get('/', asyncHandler(homeSliderBannersController.list.bind(homeSliderBannersController)));
router.get('/:id', asyncHandler(homeSliderBannersController.getById.bind(homeSliderBannersController)));
router.post('/create', asyncHandler(homeSliderBannersController.create.bind(homeSliderBannersController)));
router.put('/:id', asyncHandler(homeSliderBannersController.update.bind(homeSliderBannersController)));
router.delete('/deleteImage', asyncHandler(homeSliderBannersController.deleteImage.bind(homeSliderBannersController)));
router.delete('/:id', asyncHandler(homeSliderBannersController.remove.bind(homeSliderBannersController)));

module.exports = router;
