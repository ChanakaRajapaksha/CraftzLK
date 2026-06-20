const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { ImageUpload } = require("../models/imageUpload");
const { CmsPage, DEFAULT_CMS_PAGES } = require("../models/cmsPage");

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

const mapPage = (doc) => ({
  _id: doc._id,
  id: doc._id,
  title: doc.title,
  slug: doc.slug,
  content: doc.content || "",
  images: doc.images || [],
  status: doc.status || "active",
  seo: doc.seo || {},
  dateCreated: doc.createdAt,
  dateUpdated: doc.updatedAt,
});

async function ensureDefaultPages() {
  const count = await CmsPage.countDocuments();
  if (count > 0) return;
  await CmsPage.insertMany(DEFAULT_CMS_PAGES);
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

router.delete("/deleteImage", async (req, res) => {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];
    await cloudinary.uploader.destroy(imageName, () => {});
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get("/", async (_req, res) => {
  try {
    await ensureDefaultPages();
    const list = await CmsPage.find().sort({ title: 1 });
    return res.status(200).json({
      success: true,
      pageList: list.map(mapPage),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load CMS pages." });
  }
});

router.get("/public/:slug", async (req, res) => {
  try {
    const page = await CmsPage.findOne({ slug: req.params.slug, status: "active" });
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found." });
    }
    return res.status(200).json(mapPage(page));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load page." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found." });
    }
    return res.status(200).json(mapPage(page));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load page." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const existing = await CmsPage.findOne({ slug: body.slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Slug already exists." });
    }

    const page = new CmsPage({
      title: body.title,
      slug: body.slug,
      content: body.content || "",
      images: body.images || [],
      status: body.status || "active",
      seo: body.seo || {},
    });
    const saved = await page.save();
    return res.status(201).json(mapPage(saved));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to create page." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const duplicate = await CmsPage.findOne({
      slug: body.slug,
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Slug already exists." });
    }

    const updated = await CmsPage.findByIdAndUpdate(
      req.params.id,
      {
        title: body.title,
        slug: body.slug,
        content: body.content || "",
        images: body.images || [],
        status: body.status || "active",
        seo: body.seo || {},
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Page not found." });
    }

    return res.status(200).json(mapPage(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update page." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await CmsPage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Page not found." });
    }
    return res.status(200).json({ success: true, message: "Page deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete page." });
  }
});

module.exports = router;
