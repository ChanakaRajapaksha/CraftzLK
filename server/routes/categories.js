const { Category } = require("../models/category");
const { ImageUpload } = require("../models/imageUpload");
const { Product } = require("../models/products");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const slugify = require("slugify");
const { ensureUploadsDir } = require("../utils/uploadDir");
const { destroyAsset, getPublicIdFromUrl, removeLocalFile } = require("../utils/cloudinaryAssets");
const { isCloudinaryConfigured } = require("../utils/cloudinary");
const { listCategoriesForAdmin } = require("../utils/categoryAdmin");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

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

const mapCategoryFields = (cat, children = []) => ({
  _id: cat._id,
  id: cat._id,
  name: cat.name,
  images: cat.images,
  color: cat.color,
  slug: cat.slug,
  parentId: cat.parentId,
  description: cat.description || "",
  status: cat.status || "active",
  seo: cat.seo || {},
  children,
});

const createCategories = (categories, parentId = null) => {
  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (const cat of category) {
    categoryList.push(mapCategoryFields(cat, createCategories(categories, cat._id)));
  }

  return categoryList;
};

async function destroyCategoryImages(images = []) {
  await Promise.all(
    images.map(async (imgUrl) => {
      const publicId = getPublicIdFromUrl(imgUrl);
      if (publicId) await destroyAsset(publicId);
    })
  );
}

router.post("/upload", (req, res) => {
  upload.array("images")(req, res, async (uploadError) => {
    if (uploadError) {
      if (uploadError.message === "Only image uploads are allowed.") {
        return res.status(400).json({ success: false, message: uploadError.message });
      }
      if (uploadError.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Image must be 5 MB or smaller." });
      }
      console.error(uploadError);
      return res.status(500).json({ success: false, message: "Upload failed." });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary is not configured on the server.",
      });
    }

    const imagesArr = [];

    try {
      for (let i = 0; i < (req.files?.length || 0); i++) {
        const file = req.files[i];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "craftzlk/categories",
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        });
        imagesArr.push(result.secure_url);
        removeLocalFile(file.path);
      }

      const imagesUploaded = new ImageUpload({ images: imagesArr });
      await imagesUploaded.save();
      return res.status(200).json(imagesArr);
    } catch (error) {
      (req.files || []).forEach((file) => removeLocalFile(file.path));
      console.error(error);
      return res.status(500).json({ success: false, message: "Upload failed." });
    }
  });
});

router.get("/admin/list", async (req, res) => {
  try {
    const data = await listCategoriesForAdmin({
      page: req.query.page,
      perPage: req.query.perPage,
      search: req.query.search,
      status: req.query.status,
      parentType: req.query.parentType,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to load categories." });
  }
});

router.get("/", async (_req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      return res.status(500).json({ success: false });
    }

    const categoryData = createCategories(categoryList);
    return res.status(200).json({ categoryList: categoryData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
});

router.get("/get/count", async (_req, res) => {
  const categoryCount = await Category.countDocuments({ parentId: undefined });

  if (!categoryCount && categoryCount !== 0) {
    return res.status(500).json({ success: false });
  }

  return res.send({ categoryCount });
});

router.get("/subCat/get/count", async (_req, res) => {
  const categoryCount = await Category.find();

  if (!categoryCount) {
    return res.status(500).json({ success: false });
  }

  const subCatList = categoryCount.filter((cat) => cat.parentId !== undefined);
  return res.send({ categoryCount: subCatList.length });
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "The category with the given ID was not found.",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      category: mapCategoryFields(category),
      categoryData: [mapCategoryFields(category)],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
});

router.post("/create", async (req, res) => {
  try {
    const images = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : [];

    if (!req.body.name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const catObj = {
      name: req.body.name.trim(),
      slug: req.body.slug || slugify(req.body.name, { lower: true }),
      images,
      color: req.body.color || "",
      description: req.body.description || "",
      status: req.body.status === "inactive" ? "inactive" : "active",
      seo: req.body.seo || {},
    };

    if (req.body.parentId) {
      const parent = await Category.findById(req.body.parentId);
      if (!parent) {
        return res.status(400).json({ success: false, message: "Parent category not found." });
      }
      catObj.parentId = req.body.parentId;
    }

    const category = await Category.create(catObj);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A category with this slug already exists." });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create category." });
  }
});

router.delete("/deleteImage", async (req, res) => {
  try {
    const imgUrl = req.query.img;
    const publicId = getPublicIdFromUrl(imgUrl);

    if (!publicId) {
      return res.status(400).json({ success: false, message: "Invalid image URL." });
    }

    const response = await cloudinary.uploader.destroy(publicId);
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete image." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found!",
        success: false,
      });
    }

    const childCount = await Category.countDocuments({ parentId: req.params.id });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category that has subcategories.",
      });
    }

    const productCount = await Product.countDocuments({
      $or: [
        { catId: req.params.id },
        { subCatId: req.params.id },
        { category: req.params.id },
      ],
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category that has linked products.",
      });
    }

    await destroyCategoryImages(category.images || []);
    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Category deleted!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete category." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Category cannot be updated!",
        success: false,
      });
    }

    const images = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : existing.images;

    if (!req.body.name?.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const update = {
      name: req.body.name.trim(),
      images,
      color: req.body.color || "",
      slug: req.body.slug || slugify(req.body.name || "", { lower: true }),
      description: req.body.description || "",
      status: req.body.status === "inactive" ? "inactive" : "active",
      seo: req.body.seo || {},
    };
    const updateOp = { $set: update };

    if (req.body.parentId !== undefined) {
      if (req.body.parentId) {
        if (String(req.body.parentId) === String(req.params.id)) {
          return res.status(400).json({
            success: false,
            message: "A category cannot be its own parent.",
          });
        }
        const parent = await Category.findById(req.body.parentId);
        if (!parent) {
          return res.status(400).json({ success: false, message: "Parent category not found." });
        }
        update.parentId = req.body.parentId;
      } else {
        updateOp.$unset = { parentId: 1 };
      }
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateOp, { new: true });
    return res.status(200).json({ success: true, category });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "A category with this slug already exists." });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update category." });
  }
});

module.exports = router;
