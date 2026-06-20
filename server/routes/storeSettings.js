const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { ImageUpload } = require("../models/imageUpload");
const { StoreSettings, DEFAULT_STORE_SETTINGS } = require("../models/storeSettings");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads");
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const mapSettings = (doc) => ({
  _id: doc._id,
  id: doc._id,
  general: doc.general || DEFAULT_STORE_SETTINGS.general,
  currency: doc.currency || DEFAULT_STORE_SETTINGS.currency,
  tax: doc.tax || DEFAULT_STORE_SETTINGS.tax,
  email: {
    smtpHost: doc.email?.smtpHost || "",
    smtpPort: doc.email?.smtpPort ?? 587,
    smtpUsername: doc.email?.smtpUsername || "",
    smtpPassword: "",
    hasPassword: Boolean(doc.email?.smtpPassword),
  },
  dateUpdated: doc.updatedAt,
});

async function getOrCreateSettings() {
  let doc = await StoreSettings.findOne({ key: "default" });
  if (!doc) {
    doc = await StoreSettings.create(DEFAULT_STORE_SETTINGS);
  }
  return doc;
}

router.post("/upload", upload.array("images"), async (req, res) => {
  const imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(req.files[i].path, options, function (_error, result) {
        imagesArr.push(result.secure_url);
        fs.unlinkSync(`uploads/${req.files[i].filename}`);
      });
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
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

    const nextPassword =
      body.email?.smtpPassword?.trim()
        ? body.email.smtpPassword
        : existing.email?.smtpPassword || "";

    const updated = await StoreSettings.findOneAndUpdate(
      { key: "default" },
      {
        general: {
          storeName: body.general?.storeName || "",
          logo: body.general?.logo || "",
          favicon: body.general?.favicon || "",
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
        email: {
          smtpHost: body.email?.smtpHost || "",
          smtpPort: Number(body.email?.smtpPort) || 587,
          smtpUsername: body.email?.smtpUsername || "",
          smtpPassword: nextPassword,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(mapSettings(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update settings." });
  }
});

module.exports = router;
