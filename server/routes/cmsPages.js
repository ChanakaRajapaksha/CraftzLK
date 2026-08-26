const express = require("express");
const router = express.Router();
const multer = require("multer");
const cmsPageController = require("../controllers/cmsPageController");
const asyncHandler = require("../middleware/asyncHandler");
const { authorize } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads");
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });
const adminOnly = authorize("admin");

router.get("/public", asyncHandler(cmsPageController.listPublic.bind(cmsPageController)));
router.get("/public/nav", asyncHandler(cmsPageController.listPublicNav.bind(cmsPageController)));
router.get("/public/:slug", asyncHandler(cmsPageController.getPublicBySlug.bind(cmsPageController)));

router.get("/", adminOnly, asyncHandler(cmsPageController.list.bind(cmsPageController)));
router.get("/:id", adminOnly, asyncHandler(cmsPageController.getById.bind(cmsPageController)));
router.post("/create", adminOnly, asyncHandler(cmsPageController.create.bind(cmsPageController)));
router.put("/:id", adminOnly, asyncHandler(cmsPageController.update.bind(cmsPageController)));
router.patch("/:id/status", adminOnly, asyncHandler(cmsPageController.updateStatus.bind(cmsPageController)));
router.delete("/:id", adminOnly, asyncHandler(cmsPageController.remove.bind(cmsPageController)));

router.post("/upload", adminOnly, upload.array("images"), asyncHandler(cmsPageController.upload.bind(cmsPageController)));
router.delete("/deleteImage", adminOnly, asyncHandler(cmsPageController.deleteImage.bind(cmsPageController)));

module.exports = router;
