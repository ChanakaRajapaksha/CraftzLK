const express = require("express");
const router = express.Router();
const multer = require("multer");
const { StoreSettings, DEFAULT_STORE_SETTINGS } = require("../models/storeSettings");
const { ensureUploadsDir } = require("../utils/uploadDir");
const {
  destroyAsset,
  removeLocalFile,
  uploadStoreAsset,
} = require("../utils/cloudinaryAssets");
const {
  clearStoreAsset,
  normalizeAsset,
  replaceStoreAsset,
} = require("../utils/storeSettingsAssets");

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

const STORE_ASSET_TYPES = new Set(["logo", "favicon"]);

const mapSettings = (doc) => ({
  _id: doc._id,
  id: doc._id,
  general: {
    ...(doc.general || DEFAULT_STORE_SETTINGS.general),
    logo: normalizeAsset(doc.general?.logo),
    favicon: normalizeAsset(doc.general?.favicon),
  },
  currency: doc.currency || DEFAULT_STORE_SETTINGS.currency,
  tax: doc.tax || DEFAULT_STORE_SETTINGS.tax,
  dateUpdated: doc.updatedAt,
});

async function getOrCreateSettings() {
  let doc = await StoreSettings.findOne({ key: "default" });
  if (!doc) {
    doc = await StoreSettings.create(DEFAULT_STORE_SETTINGS);
  } else if (doc.email !== undefined) {
    await StoreSettings.updateOne({ key: "default" }, { $unset: { email: 1 } });
    doc = await StoreSettings.findOne({ key: "default" });
  }
  return doc;
}

async function persistStoreAsset(assetType, asset) {
  const updated = await StoreSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { [`general.${assetType}`]: asset } },
    { new: true, upsert: true }
  );

  return updated;
}

function handleUploadError(error, res) {
  if (error?.message === "Only image uploads are allowed.") {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Image must be 5 MB or smaller." });
  }

  if (error?.message?.includes("Cloudinary is not configured")) {
    return res.status(503).json({ success: false, message: error.message });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: "Upload failed." });
}

router.post("/upload/:assetType", (req, res) => {
  upload.single("image")(req, res, async (uploadError) => {
    if (uploadError) {
      return handleUploadError(uploadError, res);
    }

    const assetType = req.params.assetType;

    if (!STORE_ASSET_TYPES.has(assetType)) {
      return res.status(400).json({ success: false, message: "Invalid asset type." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided." });
    }

    const tempPath = req.file.path;

    try {
      const settings = await getOrCreateSettings();
      const currentAsset = normalizeAsset(settings.general?.[assetType]);
      const uploadedAsset = await uploadStoreAsset(tempPath, assetType);

      if (
        currentAsset.publicId &&
        currentAsset.publicId !== uploadedAsset.publicId
      ) {
        await destroyAsset(currentAsset.publicId);
      }

      const updated = await persistStoreAsset(assetType, uploadedAsset);

      return res.status(200).json({
        success: true,
        asset: uploadedAsset,
        url: uploadedAsset.url,
        settings: mapSettings(updated),
      });
    } catch (error) {
      return handleUploadError(error, res);
    } finally {
      removeLocalFile(tempPath);
    }
  });
});

router.delete("/assets/:assetType", async (req, res) => {
  const assetType = req.params.assetType;

  if (!STORE_ASSET_TYPES.has(assetType)) {
    return res.status(400).json({ success: false, message: "Invalid asset type." });
  }

  try {
    const settings = await getOrCreateSettings();
    const clearedAsset = await clearStoreAsset(settings.general?.[assetType]);
    const updated = await persistStoreAsset(assetType, clearedAsset);

    return res.status(200).json({
      success: true,
      asset: clearedAsset,
      settings: mapSettings(updated),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to remove asset." });
  }
});

router.get("/", async (_req, res) => {
  try {
    const doc = await getOrCreateSettings();
    return res.status(200).json({
      success: true,
      settings: mapSettings(doc),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load settings." });
  }
});

router.put("/", async (req, res) => {
  try {
    const body = req.body;
    const existing = await getOrCreateSettings();

    const logo = await replaceStoreAsset(
      existing.general?.logo,
      body.general?.logo
    );
    const favicon = await replaceStoreAsset(
      existing.general?.favicon,
      body.general?.favicon
    );

    const update = {
      general: {
        storeName: body.general?.storeName || "",
        logo,
        favicon,
        contactEmail: body.general?.contactEmail || "",
        contactPhone: body.general?.contactPhone || "",
        contactAddress: body.general?.contactAddress || "",
      },
      currency: {
        code: body.currency?.code || "LKR",
        symbol: body.currency?.symbol || "Rs",
        decimalFormat: body.currency?.decimalFormat || "2",
      },
      tax: {
        enabled: body.tax?.enabled ?? true,
        rules: body.tax?.rules || "exclusive",
        percentage: Number(body.tax?.percentage) || 0,
      },
    };

    const updated = await StoreSettings.findOneAndUpdate(
      { key: "default" },
      { $set: update, $unset: { email: 1 } },
      { new: true, upsert: true }
    );

    return res.status(200).json(mapSettings(updated));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update settings." });
  }
});

module.exports = router;
