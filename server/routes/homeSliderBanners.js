const { HomeSliderBanner } = require("../models/homeSliderBanner");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

let imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const mapBanner = (doc) => ({
  _id: doc._id,
  id: doc._id,
  heading: doc.heading,
  title: doc.title || doc.heading,
  description: doc.description || "",
  buttonText: doc.buttonText || "Shop Now",
  buttonUrl: doc.buttonUrl || "",
  link: doc.link || doc.buttonUrl || "",
  desktopImage: doc.desktopImage || "",
  mobileImage: doc.mobileImage || "",
  displayOrder: doc.displayOrder ?? 0,
  status: doc.status || "active",
  dateCreated: doc.createdAt,
});

router.post("/upload", upload.array("images"), async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const list = await HomeSliderBanner.find().sort({ displayOrder: 1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      bannerList: list.map(mapBanner),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load banners." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await HomeSliderBanner.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Banner not found." });
    }
    return res.status(200).json(mapBanner(item));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load banner." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const entry = new HomeSliderBanner({
      heading: body.heading,
      title: body.title || body.heading,
      description: body.description || "",
      buttonText: body.buttonText || "Shop Now",
      buttonUrl: body.buttonUrl || "",
      link: body.link || body.buttonUrl || "",
      desktopImage: body.desktopImage || "",
      mobileImage: body.mobileImage || "",
      displayOrder: Number(body.displayOrder) || 0,
      status: body.status || "active",
    });

    const saved = await entry.save();
    return res.status(201).json(mapBanner(saved));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to create banner." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await HomeSliderBanner.findByIdAndUpdate(
      req.params.id,
      {
        heading: body.heading,
        title: body.title || body.heading,
        description: body.description || "",
        buttonText: body.buttonText || "Shop Now",
        buttonUrl: body.buttonUrl || "",
        link: body.link || body.buttonUrl || "",
        desktopImage: body.desktopImage || "",
        mobileImage: body.mobileImage || "",
        displayOrder: Number(body.displayOrder) || 0,
        status: body.status || "active",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Banner not found." });
    }

    return res.status(200).json(mapBanner(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update banner." });
  }
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(imageName, () => {});

  if (response) {
    res.status(200).send(response);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await HomeSliderBanner.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Banner not found." });
    }

    for (const img of [item.desktopImage, item.mobileImage].filter(Boolean)) {
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      cloudinary.uploader.destroy(imageName, () => {});
    }

    await HomeSliderBanner.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Banner deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete banner." });
  }
});

module.exports = router;
