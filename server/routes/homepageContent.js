const express = require("express");
const router = express.Router();
const multer = require("multer");
const homepageContentController = require("../controllers/homepageContentController");
const asyncHandler = require("../middleware/asyncHandler");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("images"), asyncHandler(homepageContentController.upload.bind(homepageContentController)));
router.delete("/deleteImage", asyncHandler(homepageContentController.deleteImage.bind(homepageContentController)));
router.get("/", asyncHandler(homepageContentController.get.bind(homepageContentController)));
router.put("/", asyncHandler(homepageContentController.update.bind(homepageContentController)));
router.get("/public/featured-products", asyncHandler(homepageContentController.getFeaturedProducts.bind(homepageContentController)));
router.get("/public/trending-products", asyncHandler(homepageContentController.getTrendingProducts.bind(homepageContentController)));
router.get("/public/new-arrivals", asyncHandler(homepageContentController.getNewArrivals.bind(homepageContentController)));
router.get("/public/best-sellers", asyncHandler(homepageContentController.getBestSellers.bind(homepageContentController)));
router.get("/public/popular-categories", asyncHandler(homepageContentController.getPopularCategories.bind(homepageContentController)));

module.exports = router;
