const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
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

router.post(
  '/upload',
  upload.array('images'),
  asyncHandler(productController.upload.bind(productController))
);
router.get('/admin/list', asyncHandler(productController.adminList.bind(productController)));
router.get('/active', asyncHandler(productController.listActive.bind(productController)));
router.get('/', asyncHandler(productController.list.bind(productController)));
router.get('/catName', asyncHandler(productController.listByCatName.bind(productController)));
router.get('/catId', asyncHandler(productController.listByCatId.bind(productController)));
router.get('/subCatId', asyncHandler(productController.listBySubCatId.bind(productController)));
router.get('/fiterByPrice', asyncHandler(productController.filterByPrice.bind(productController)));
router.get('/rating', asyncHandler(productController.filterByRating.bind(productController)));
router.get('/get/count', asyncHandler(productController.getCount.bind(productController)));
router.get('/featured', asyncHandler(productController.getFeatured.bind(productController)));
router.get('/recentlyViewd', asyncHandler(productController.getRecentlyViewed.bind(productController)));
router.post('/recentlyViewd', asyncHandler(productController.addRecentlyViewed.bind(productController)));
router.post('/create', asyncHandler(productController.create.bind(productController)));
router.post('/bulk/delete', asyncHandler(productController.bulkDelete.bind(productController)));
router.post('/bulk/status', asyncHandler(productController.bulkStatus.bind(productController)));
router.get('/:id', asyncHandler(productController.getById.bind(productController)));
router.delete('/deleteImage', asyncHandler(productController.deleteImage.bind(productController)));
router.delete('/:id', asyncHandler(productController.remove.bind(productController)));
router.put('/:id', asyncHandler(productController.update.bind(productController)));

module.exports = router;
