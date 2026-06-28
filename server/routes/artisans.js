const express = require('express');
const router = express.Router();
const multer = require('multer');
const artisanController = require('../controllers/artisanController');
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

router.post('/upload', upload.array('images'), asyncHandler(artisanController.upload.bind(artisanController)));
router.get('/', asyncHandler(artisanController.list.bind(artisanController)));
router.get('/get/count', asyncHandler(artisanController.getCount.bind(artisanController)));
router.get('/:id', asyncHandler(artisanController.getById.bind(artisanController)));
router.post('/create', asyncHandler(artisanController.create.bind(artisanController)));
router.delete('/deleteImage', asyncHandler(artisanController.deleteImage.bind(artisanController)));
router.delete('/:id', asyncHandler(artisanController.remove.bind(artisanController)));
router.put('/:id', asyncHandler(artisanController.update.bind(artisanController)));

module.exports = router;
