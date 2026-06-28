const { Category } = require('../models/category');
const { ImageUpload } = require('../models/imageUpload');
const { Product } = require('../models/products');
const slugify = require('slugify');
const { destroyAsset, getPublicIdFromUrl, removeLocalFile } = require('../utils/cloudinaryAssets');
const { isCloudinaryConfigured } = require('../utils/cloudinary');
const { listCategoriesForAdmin } = require('../utils/categoryAdmin');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const mapCategoryFields = (cat, children = []) => ({
  _id: cat._id,
  id: cat._id,
  name: cat.name,
  images: cat.images,
  color: cat.color,
  slug: cat.slug,
  parentId: cat.parentId,
  description: cat.description || '',
  status: cat.status || 'active',
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

const isActiveCategory = (cat) => !cat.status || cat.status === 'active';

async function destroyCategoryImages(images = []) {
  await Promise.all(
    images.map(async (imgUrl) => {
      const publicId = getPublicIdFromUrl(imgUrl);
      if (publicId) await destroyAsset(publicId);
    })
  );
}

class CategoryService {
  async uploadImages(files) {
    const imagesArr = [];

    for (let i = 0; i < (files?.length || 0); i++) {
      const file = files[i];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'craftzlk/categories',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      });
      imagesArr.push(result.secure_url);
      removeLocalFile(file.path);
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return imagesArr;
  }

  cleanupUploadFiles(files) {
    (files || []).forEach((file) => removeLocalFile(file.path));
  }

  async adminList(query) {
    return listCategoriesForAdmin({
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      status: query.status,
      parentType: query.parentType,
    });
  }

  async list() {
    const categoryList = await Category.find();

    if (!categoryList) {
      const error = new Error('Failed to load categories');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    return { categoryList: createCategories(categoryList) };
  }

  async listActive() {
    const allCategories = await Category.find();
    const activeCategories = allCategories.filter(isActiveCategory);

    return {
      success: true,
      categoryList: createCategories(activeCategories),
    };
  }

  async getCount() {
    const categoryCount = await Category.countDocuments({ parentId: undefined });

    if (!categoryCount && categoryCount !== 0) {
      const error = new Error('Failed to get count');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    return { categoryCount };
  }

  async getSubCatCount() {
    const categoryCount = await Category.find();

    if (!categoryCount) {
      const error = new Error('Failed to get subcategory count');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    const subCatList = categoryCount.filter((cat) => cat.parentId !== undefined);
    return { categoryCount: subCatList.length };
  }

  async getById(id) {
    const category = await Category.findById(id);

    if (!category) {
      const error = new Error('The category with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    return {
      success: true,
      category: mapCategoryFields(category),
      categoryData: [mapCategoryFields(category)],
    };
  }

  async create(body) {
    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];

    if (!body.name?.trim()) {
      const error = new Error('Category name is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const catObj = {
      name: body.name.trim(),
      slug: body.slug || slugify(body.name, { lower: true }),
      images,
      color: body.color || '',
      description: body.description || '',
      status: body.status === 'inactive' ? 'inactive' : 'active',
      seo: body.seo || {},
    };

    if (body.parentId) {
      const parent = await Category.findById(body.parentId);
      if (!parent) {
        const error = new Error('Parent category not found.');
        error.statusCode = 400;
        error.payload = { success: false, message: error.message };
        throw error;
      }
      catObj.parentId = body.parentId;
    }

    try {
      const category = await Category.create(catObj);
      return { success: true, category };
    } catch (error) {
      if (error?.code === 11000) {
        const dupError = new Error('A category with this slug already exists.');
        dupError.statusCode = 409;
        dupError.payload = { success: false, message: dupError.message };
        throw dupError;
      }
      throw error;
    }
  }

  async deleteImage(imgUrl) {
    const publicId = getPublicIdFromUrl(imgUrl);

    if (!publicId) {
      const error = new Error('Invalid image URL.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return cloudinary.uploader.destroy(publicId);
  }

  async remove(id) {
    const category = await Category.findById(id);

    if (!category) {
      const error = new Error('Category not found!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    const childCount = await Category.countDocuments({ parentId: id });
    if (childCount > 0) {
      const error = new Error('Cannot delete a category that has subcategories.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const productCount = await Product.countDocuments({
      $or: [{ catId: id }, { subCatId: id }, { category: id }],
    });

    if (productCount > 0) {
      const error = new Error('Cannot delete a category that has linked products.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    await destroyCategoryImages(category.images || []);
    await Category.findByIdAndDelete(id);

    return { success: true, message: 'Category deleted!' };
  }

  async update(id, body) {
    const existing = await Category.findById(id);

    if (!existing) {
      const error = new Error('Category cannot be updated!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : existing.images;

    if (!body.name?.trim()) {
      const error = new Error('Category name is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const update = {
      name: body.name.trim(),
      images,
      color: body.color || '',
      slug: body.slug || slugify(body.name || '', { lower: true }),
      description: body.description || '',
      status: body.status === 'inactive' ? 'inactive' : 'active',
      seo: body.seo || {},
    };
    const updateOp = { $set: update };

    if (body.parentId !== undefined) {
      if (body.parentId) {
        if (String(body.parentId) === String(id)) {
          const error = new Error('A category cannot be its own parent.');
          error.statusCode = 400;
          error.payload = { success: false, message: error.message };
          throw error;
        }
        const parent = await Category.findById(body.parentId);
        if (!parent) {
          const error = new Error('Parent category not found.');
          error.statusCode = 400;
          error.payload = { success: false, message: error.message };
          throw error;
        }
        update.parentId = body.parentId;
      } else {
        updateOp.$unset = { parentId: 1 };
      }
    }

    try {
      const category = await Category.findByIdAndUpdate(id, updateOp, { new: true });
      return { success: true, category };
    } catch (error) {
      if (error?.code === 11000) {
        const dupError = new Error('A category with this slug already exists.');
        dupError.statusCode = 409;
        dupError.payload = { success: false, message: dupError.message };
        throw dupError;
      }
      throw error;
    }
  }
}

module.exports = new CategoryService();
