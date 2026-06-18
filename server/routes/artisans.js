const { Artisan } = require("../models/artisan");
const { Product } = require("../models/products");
const { ImageUpload } = require("../models/imageUpload");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const slugify = require("slugify");

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

const mapArtisan = (artisan, productCount = 0) => ({
  _id: artisan._id,
  id: artisan._id,
  name: artisan.name,
  slug: artisan.slug,
  images: artisan.images || [],
  bio: artisan.bio || "",
  location: artisan.location || "",
  story: artisan.story || "",
  social: artisan.social || {},
  status: artisan.status || "active",
  productCount,
  dateCreated: artisan.createdAt,
});

async function getProductCountsByArtisan(artisans) {
  const counts = {};

  await Promise.all(
    artisans.map(async (artisan) => {
      const count = await Product.countDocuments({
        brand: { $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });
      counts[String(artisan._id)] = count;
    })
  );

  return counts;
}

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

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();
    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const artisanList = await Artisan.find().sort({ createdAt: -1 });

    if (!artisanList) {
      return res.status(500).json({ success: false });
    }

    const productCounts = await getProductCountsByArtisan(artisanList);

    return res.status(200).json({
      artisanList: artisanList.map((artisan) =>
        mapArtisan(artisan, productCounts[String(artisan._id)] || 0)
      ),
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const artisanCount = await Artisan.countDocuments();
    return res.send({ artisanCount });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({ message: "The artisan with the given ID was not found." });
    }

    const productCount = await Product.countDocuments({
      brand: { $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    return res.status(200).json({
      artisanData: [mapArtisan(artisan, productCount)],
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.post("/create", async (req, res) => {
  const images =
    Array.isArray(req.body.images) && req.body.images.length ? req.body.images : imagesArr;

  let artisan = new Artisan({
    name: req.body.name,
    slug: req.body.slug || slugify(req.body.name, { lower: true }),
    images,
    bio: req.body.bio || "",
    location: req.body.location || "",
    story: req.body.story || "",
    social: req.body.social || {},
    status: req.body.status === "inactive" ? "inactive" : "active",
  });

  artisan = await artisan.save();
  imagesArr = [];

  return res.status(201).json(artisan);
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(imageName, () => {});

  if (response) {
    return res.status(200).send(response);
  }

  return res.status(500).json({ success: false });
});

router.delete("/:id", async (req, res) => {
  const artisan = await Artisan.findById(req.params.id);

  if (!artisan) {
    return res.status(404).json({
      message: "Artisan not found!",
      success: false,
    });
  }

  for (const img of artisan.images || []) {
    const urlArr = img.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];
    cloudinary.uploader.destroy(imageName, () => {});
  }

  await Artisan.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Artisan deleted!",
  });
});

router.put("/:id", async (req, res) => {
  const artisan = await Artisan.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug || slugify(req.body.name || "", { lower: true }),
      images: req.body.images,
      bio: req.body.bio || "",
      location: req.body.location || "",
      story: req.body.story || "",
      social: req.body.social || {},
      status: req.body.status === "inactive" ? "inactive" : "active",
    },
    { new: true }
  );

  if (!artisan) {
    return res.status(500).json({
      message: "Artisan cannot be updated!",
      success: false,
    });
  }

  imagesArr = [];

  return res.send(artisan);
});

module.exports = router;
