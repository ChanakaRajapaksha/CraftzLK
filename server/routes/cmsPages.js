const express = require("express");
const router = express.Router();
const multer = require("multer");
const cmsPageController = require("../controllers/cmsPageController");
const asyncHandler = require("../middleware/asyncHandler");

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads");
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.array("images"), asyncHandler(cmsPageController.upload.bind(cmsPageController)));
router.delete("/deleteImage", asyncHandler(cmsPageController.deleteImage.bind(cmsPageController)));
router.get("/", asyncHandler(cmsPageController.list.bind(cmsPageController)));
router.get("/public/:slug", asyncHandler(cmsPageController.getPublicBySlug.bind(cmsPageController)));
router.get("/:id", asyncHandler(cmsPageController.getById.bind(cmsPageController)));
router.post("/create", asyncHandler(cmsPageController.create.bind(cmsPageController)));
router.put("/:id", asyncHandler(cmsPageController.update.bind(cmsPageController)));
router.delete("/:id", asyncHandler(cmsPageController.remove.bind(cmsPageController)));

module.exports = router;
