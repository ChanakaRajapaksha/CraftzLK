const express = require("express");
const router = express.Router();
const multer = require("multer");
const storeSettingsController = require("../controllers/storeSettingsController");
const asyncHandler = require("../middleware/asyncHandler");
const { ensureUploadsDir } = require("../utils/uploadDir");

const uploadsDir = ensureUploadsDir();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed."));
      return;
    }
    cb(null, true);
  },
});

router.post("/upload/:assetType", (req, res) => {
  upload.single("image")(req, res, (uploadError) => {
    storeSettingsController.uploadAsset(req, res, uploadError);
  });
});

router.delete("/assets/:assetType", asyncHandler(storeSettingsController.deleteAsset.bind(storeSettingsController)));
router.get("/", asyncHandler(storeSettingsController.get.bind(storeSettingsController)));
router.put("/", asyncHandler(storeSettingsController.update.bind(storeSettingsController)));

module.exports = router;
