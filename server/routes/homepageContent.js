const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const {
  HomepageContent,
  DEFAULT_HOMEPAGE_CONTENT,
} = require("../models/homepageContent");
const { Product } = require("../models/products");
const { Orders } = require("../models/orders");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

function mapContent(doc) {
  const data = doc.toObject ? doc.toObject() : doc;
  return {
    _id: data._id,
    id: data._id,
    featuredProducts: data.featuredProducts || DEFAULT_HOMEPAGE_CONTENT.featuredProducts,
    trendingProducts: data.trendingProducts || DEFAULT_HOMEPAGE_CONTENT.trendingProducts,
    newArrivals: data.newArrivals || DEFAULT_HOMEPAGE_CONTENT.newArrivals,
    bestSellers: data.bestSellers || DEFAULT_HOMEPAGE_CONTENT.bestSellers,
    popularCategories: data.popularCategories || DEFAULT_HOMEPAGE_CONTENT.popularCategories,
    updatedAt: data.updatedAt,
  };
}

async function getOrCreateContent() {
  let doc = await HomepageContent.findOne({ key: "default" });
  if (!doc) {
    doc = await HomepageContent.create({
      key: "default",
      ...DEFAULT_HOMEPAGE_CONTENT,
    });
  }
  return doc;
}

async function resolveProductsByIds(ids) {
  if (!ids?.length) return [];
  const products = await Product.find({ _id: { $in: ids } }).populate("category");
  const map = new Map(products.map((p) => [String(p._id), p]));
  return ids.map((id) => map.get(String(id))).filter(Boolean);
}

async function getBestSellerIds(limit = 10) {
  const orders = await Orders.find({
    paymentStatus: { $in: ["paid", "pending"] },
    status: { $nin: ["cancelled", "returned"] },
  });

  const sales = {};
  orders.forEach((order) => {
    (order.products || []).forEach((item) => {
      const id = String(item.productId || "");
      if (!id) return;
      sales[id] = (sales[id] || 0) + Number(item.quantity || 1);
    });
  });

  return Object.entries(sales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
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

router.get("/", async (req, res) => {
  try {
    const doc = await getOrCreateContent();
    return res.status(200).json({ success: true, content: mapContent(doc) });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load homepage content." });
  }
});

router.put("/", async (req, res) => {
  try {
    const body = req.body || {};
    const doc = await getOrCreateContent();

    if (body.featuredProducts) doc.featuredProducts = body.featuredProducts;
    if (body.trendingProducts) doc.trendingProducts = body.trendingProducts;
    if (body.newArrivals) doc.newArrivals = body.newArrivals;
    if (body.bestSellers) doc.bestSellers = body.bestSellers;
    if (body.popularCategories) doc.popularCategories = body.popularCategories;

    await doc.save();
    return res.status(200).json({ success: true, content: mapContent(doc) });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update homepage content." });
  }
});

router.get("/public/featured-products", async (req, res) => {
  try {
    const doc = await getOrCreateContent();
    if (!doc.featuredProducts?.enabled) {
      return res.status(200).json({ products: [] });
    }
    const products = await resolveProductsByIds(doc.featuredProducts.productIds || []);
    return res.status(200).json({ products });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get("/public/trending-products", async (req, res) => {
  try {
    const doc = await getOrCreateContent();
    if (!doc.trendingProducts?.enabled) {
      return res.status(200).json({ products: [] });
    }
    const products = await resolveProductsByIds(doc.trendingProducts.productIds || []);
    return res.status(200).json({ products });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get("/public/new-arrivals", async (req, res) => {
  try {
    const doc = await getOrCreateContent();
    if (!doc.newArrivals?.enabled) {
      return res.status(200).json({ products: [] });
    }

    if (doc.newArrivals.mode === "manual") {
      const products = await resolveProductsByIds(doc.newArrivals.productIds || []);
      return res.status(200).json({ products, mode: "manual" });
    }

    const limit = Number(doc.newArrivals.autoLimit) || 10;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category");
    return res.status(200).json({ products, mode: "auto" });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get("/public/best-sellers", async (req, res) => {
  try {
    const doc = await getOrCreateContent();
    if (!doc.bestSellers?.enabled) {
      return res.status(200).json({ products: [] });
    }

    const limit = Number(doc.bestSellers.autoLimit) || 10;
    const ids = await getBestSellerIds(limit);
    const products = await resolveProductsByIds(ids);
    return res.status(200).json({ products, mode: "auto" });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get("/public/popular-categories", async (req, res) => {
  try {
    const doc = await getOrCreateContent();
    if (!doc.popularCategories?.enabled) {
      return res.status(200).json({ items: [] });
    }

    const items = [...(doc.popularCategories.items || [])].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    return res.status(200).json({ items });
  } catch {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
