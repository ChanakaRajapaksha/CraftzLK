const { Category } = require('../models/category.js');
const { Product } = require('../models/products.js');
const { listProductsForAdmin } = require('../utils/productAdmin');
const promoDiscountsService = require('./promoDiscountsService');
const { MyList } = require('../models/myList');
const { Cart } = require('../models/cart');
const { RecentlyViewd } = require('../models/recentlyViewd.js');
const { ImageUpload } = require('../models/imageUpload.js');
const { parseOptionalCost } = require('../utils/reportProfit');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

function toStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [String(value)];
}

function normalizeShortDescription(value) {
  if (value && typeof value === 'object' && Array.isArray(value.bullets)) {
    return {
      bullets: value.bullets.map((line) => String(line || '').trim()).filter(Boolean),
      disclaimer: value.disclaimer || '',
    };
  }
  if (typeof value === 'string' && value.trim()) {
    return {
      bullets: value.split('\n').map((line) => line.trim()).filter(Boolean),
      disclaimer: '',
    };
  }
  return { bullets: [], disclaimer: '' };
}

function normalizeDescription(value) {
  if (Array.isArray(value)) {
    return {
      points: value
        .map((point) => ({
          title: String(point?.title || '').trim(),
          text: String(point?.text || '').trim(),
        }))
        .filter((point) => point.title || point.text),
    };
  }

  if (value && typeof value === 'object' && Array.isArray(value.points)) {
    return {
      points: value.points
        .map((point) => ({
          title: String(point?.title || '').trim(),
          text: String(point?.text || '').trim(),
        }))
        .filter((point) => point.title || point.text),
    };
  }

  if (typeof value === 'string' && value.trim()) {
    return { points: [{ title: '', text: value.trim() }] };
  }

  return { points: [] };
}

function normalizeProductLocation(value) {
  if (!value || value === 'All') {
    return [{ value: 'All', label: 'All' }];
  }

  if (Array.isArray(value)) {
    const locations = value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const locValue = String(item.value || item.label || '').trim();
          const label = String(item.label || item.value || locValue).trim();
          if (!locValue) return null;
          return { value: locValue, label: label || locValue };
        }

        const text = String(item || '').trim();
        if (!text) return null;
        return { value: text, label: text };
      })
      .filter(Boolean);

    return locations.length ? locations : [{ value: 'All', label: 'All' }];
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text || text === 'All') {
      return [{ value: 'All', label: 'All' }];
    }
    return [{ value: text, label: text }];
  }

  return [{ value: 'All', label: 'All' }];
}

function validateProductPayload(body, images = []) {
  const errors = [];

  if (!body.name?.trim()) errors.push('Product name is required.');

  const shortBullets = normalizeShortDescription(body.shortDescription).bullets;
  if (!shortBullets.length) errors.push('Add at least one short description point.');

  const descriptionPoints = normalizeDescription(body.description).points.filter(
    (point) => point.title && point.text
  );
  if (!descriptionPoints.length) {
    errors.push('Add at least one full description point with a title and text.');
  }

  if (!Array.isArray(images) || !images.length) {
    errors.push('At least one product image is required.');
  }

  if (!body.category && !body.catId) {
    errors.push('Main category is required.');
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    errors.push('Regular price is required.');
  }

  const stock = Number(body.countInStock);
  if (!Number.isFinite(stock) || stock < 0) {
    errors.push('Stock quantity is required.');
  }

  if (errors.length) {
    const error = new Error(errors[0]);
    error.statusCode = 400;
    error.payload = { success: false, message: errors[0], errors };
    throw error;
  }
}

function normalizeTrustBadges(value) {
  const defaults = {
    authentic: '100% Authentic',
    delivery: 'Island wide Delivery',
    express: 'Express Delivery: Colombo 1-12',
  };
  const source = value && typeof value === 'object' ? value : {};

  return {
    authentic: String(source.authentic ?? defaults.authentic).trim(),
    delivery: String(source.delivery ?? defaults.delivery).trim(),
    express: String(source.express ?? defaults.express).trim(),
  };
}

function normalizeVariantGroups(variants) {
  if (!Array.isArray(variants)) return [];

  return variants.map((group) => {
    const options = (Array.isArray(group?.options) ? group.options : []).map((opt) => ({
      label: String(opt?.label || '').trim(),
      sku: String(opt?.sku || '').trim(),
      price: Number(opt?.price) || 0,
      stock: Number(opt?.stock) || 0,
      stockStatus: opt?.stockStatus || 'in_stock',
      image: String(opt?.image || '').trim(),
      isDefault: Boolean(opt?.isDefault),
    }));

    if (!options.length) {
      return {
        variantName: String(group?.variantName || '').trim(),
        options: [],
      };
    }

    const defaultIndex = options.findIndex((opt) => opt.isDefault);
    const resolvedIndex = defaultIndex >= 0 ? defaultIndex : 0;
    const normalizedOptions = options.map((opt, index) => ({
      ...opt,
      isDefault: index === resolvedIndex,
    }));

    return {
      variantName: String(group?.variantName || '').trim(),
      options: normalizedOptions,
    };
  });
}

function mapProductBody(body, images = []) {
  return {
    name: body.name,
    sku: body.sku || '',
    slug: body.slug || '',
    shortDescription: normalizeShortDescription(body.shortDescription),
    description: normalizeDescription(body.description),
    images,
    brand: body.brand || '',
    price: Number(body.price) || 0,
    productCost: parseOptionalCost(body.productCost),
    oldPrice: Number(body.oldPrice) || 0,
    discountPrice: Number(body.discountPrice) || 0,
    discountType: body.discountType || 'percentage',
    catId: body.catId,
    catName: body.catName,
    subCat: body.subCat,
    subCatId: body.subCatId,
    subCatName: body.subCatName,
    category: body.category,
    countInStock: Number(body.countInStock) || 0,
    stockStatus: body.stockStatus || 'in_stock',
    minStockAlert: Number(body.minStockAlert) || 5,
    status: body.status || 'active',
    rating: Number(body.rating) || 0,
    isFeatured: Boolean(body.isFeatured),
    discount: Number(body.discount) || 0,
    productRam: toStringArray(body.productRam),
    size: toStringArray(body.size),
    productWeight: toStringArray(body.productWeight),
    location: normalizeProductLocation(body.location),
    variants: normalizeVariantGroups(body.variants),
    customizationOptions: Array.isArray(body.customizationOptions) ? body.customizationOptions : [],
    shipping: body.shipping || {},
    trustBadges: normalizeTrustBadges(body.trustBadges),
    seo: body.seo || {},
  };
}

function getImageNameFromUrl(imgUrl) {
  const urlArr = imgUrl.split('/');
  const image = urlArr[urlArr.length - 1];
  return image.split('.')[0];
}

class ProductService {
  async upload(files) {
    const imagesArr = [];

    for (let i = 0; i < files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(
        files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${files[i].filename}`);
        }
      );
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return imagesArr;
  }

  async adminList(query) {
    return listProductsForAdmin(query);
  }

  async listActive() {
    const products = await Product.find({ status: 'active' })
      .sort({ dateCreated: -1 })
      .select('_id name catName catId images status variants')
      .lean();

    return {
      success: true,
      products: products.map((product) => ({
        _id: product._id,
        id: product._id,
        name: product.name,
        catName: product.catName || '',
        catId: product.catId || '',
        images: product.images || [],
        status: product.status || 'active',
        variants: (product.variants || []).map((group) => ({
          variantName: group.variantName || '',
          options: (group.options || [])
            .map((option) => ({
              _id: option._id,
              id: option._id,
              label: option.label || '',
            }))
            .filter((option) => option.label),
        })),
      })),
    };
  }

  async list(query) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.perPage);
    const filter = { status: { $ne: 'inactive' } };
    const totalPosts = await Product.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalPosts / (perPage || totalPosts || 1)));

    if (totalPosts > 0 && perPage && page > totalPages) {
      const error = new Error('Page not found');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    let productList = [];

    if (query.page !== undefined && query.perPage !== undefined) {
      if (query.location !== undefined) {
        const productListArr = await Product.find(filter)
          .sort({ dateCreated: -1 })
          .populate('category')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();

        for (let i = 0; i < productListArr.length; i++) {
          for (let j = 0; j < productListArr[i].location.length; j++) {
            if (productListArr[i].location[j].value === query.location) {
              productList.push(productListArr[i]);
            }
          }
        }
      } else {
        productList = await Product.find(filter)
          .sort({ dateCreated: -1 })
          .populate('category')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();
      }
    } else {
      productList = await Product.find(filter).sort({ dateCreated: -1 });
    }

    return {
      products: productList,
      totalPages: totalPages,
      page: page,
      total: totalPosts,
      perPage: perPage || productList.length,
    };
  }

  async listByCatName(query) {
    let productList = [];

    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.perPage);
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (totalPosts > 0 && page > totalPages) {
      const error = new Error('Page not found');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    if (query.page !== undefined && query.perPage !== undefined) {
      const productListArr = await Product.find({ catName: query.catName })
        .populate('category')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

      return {
        products: productListArr,
        totalPages: totalPages,
        page: page,
      };
    }

    const productListArr = await Product.find({ catName: query.catName })
      .populate('category')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    for (let i = 0; i < productListArr.length; i++) {
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === query.location) {
          productList.push(productListArr[i]);
        }
      }
    }

    if (query.location !== 'All') {
      return {
        products: productList,
        totalPages: totalPages,
        page: page,
      };
    }

    return {
      products: productListArr,
      totalPages: totalPages,
      page: page,
    };
  }

  async listByCatId(query) {
    let productList = [];
    let productListArr = [];

    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.perPage);
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (totalPosts > 0 && page > totalPages) {
      const error = new Error('Page not found');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    if (query.page !== undefined && query.perPage !== undefined) {
      const listArr = await Product.find({ catId: query.catId })
        .populate('category')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

      return {
        products: listArr,
        totalPages: totalPages,
        page: page,
      };
    }

    productListArr = await Product.find({ catId: query.catId });

    for (let i = 0; i < productListArr.length; i++) {
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === query.location) {
          productList.push(productListArr[i]);
        }
      }
    }

    if (query.location !== 'All' && query.location !== undefined) {
      return {
        products: productList,
        totalPages: totalPages,
        page: page,
      };
    }

    return {
      products: productListArr,
      totalPages: totalPages,
      page: page,
    };
  }

  async listBySubCatId(query) {
    let productList = [];

    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.perPage);
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (totalPosts > 0 && page > totalPages) {
      const error = new Error('Page not found');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    if (query.page !== undefined && query.perPage !== undefined) {
      const productListArr = await Product.find({ subCatId: query.subCatId })
        .populate('category')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

      return {
        products: productListArr,
        totalPages: totalPages,
        page: page,
      };
    }

    const productListArr = await Product.find({ subCatId: query.subCatId });

    for (let i = 0; i < productListArr.length; i++) {
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === query.location) {
          productList.push(productListArr[i]);
        }
      }
    }

    if (query.location !== 'All') {
      return {
        products: productList,
        totalPages: totalPages,
        page: page,
      };
    }

    return {
      products: productListArr,
      totalPages: totalPages,
      page: page,
    };
  }

  async filterByPrice(query) {
    let productList = [];

    if (query.catId !== '' && query.catId !== undefined) {
      const productListArr = await Product.find({
        catId: query.catId,
      }).populate('category');

      if (query.location !== 'All') {
        for (let i = 0; i < productListArr.length; i++) {
          for (let j = 0; j < productListArr[i].location.length; j++) {
            if (productListArr[i].location[j].value === query.location) {
              productList.push(productListArr[i]);
            }
          }
        }
      } else {
        productList = productListArr;
      }
    } else if (query.subCatId !== '' && query.subCatId !== undefined) {
      const productListArr = await Product.find({
        subCatId: query.subCatId,
      }).populate('category');

      if (query.location !== 'All') {
        for (let i = 0; i < productListArr.length; i++) {
          for (let j = 0; j < productListArr[i].location.length; j++) {
            if (productListArr[i].location[j].value === query.location) {
              productList.push(productListArr[i]);
            }
          }
        }
      } else {
        productList = productListArr;
      }
    }

    const filteredProducts = productList.filter((product) => {
      if (query.minPrice && product.price < parseInt(+query.minPrice)) {
        return false;
      }
      if (query.maxPrice && product.price > parseInt(+query.maxPrice)) {
        return false;
      }
      return true;
    });

    return {
      products: filteredProducts,
      totalPages: 0,
      page: 0,
    };
  }

  async filterByRating(query) {
    let productList = [];

    if (query.catId !== '' && query.catId !== undefined) {
      const productListArr = await Product.find({
        catId: query.catId,
        rating: query.rating,
      }).populate('category');

      if (query.location !== 'All') {
        for (let i = 0; i < productListArr.length; i++) {
          for (let j = 0; j < productListArr[i].location.length; j++) {
            if (productListArr[i].location[j].value === query.location) {
              productList.push(productListArr[i]);
            }
          }
        }
      } else {
        productList = productListArr;
      }
    } else if (query.subCatId !== '' && query.subCatId !== undefined) {
      const productListArr = await Product.find({
        subCatId: query.subCatId,
        rating: query.rating,
      }).populate('category');

      if (query.location !== 'All') {
        for (let i = 0; i < productListArr.length; i++) {
          for (let j = 0; j < productListArr[i].location.length; j++) {
            if (productListArr[i].location[j].value === query.location) {
              productList.push(productListArr[i]);
            }
          }
        }
      } else {
        productList = productListArr;
      }
    }

    return {
      products: productList,
      totalPages: 0,
      page: 0,
    };
  }

  async getCount() {
    const productsCount = await Product.countDocuments();
    return { productsCount, isEmpty: !productsCount };
  }

  async getFeatured(query) {
    let productList = [];
    if (query.location !== undefined && query.location !== null) {
      const productListArr = await Product.find({ isFeatured: true }).populate(
        'category'
      );

      for (let i = 0; i < productListArr.length; i++) {
        for (let j = 0; j < productListArr[i].location.length; j++) {
          if (productListArr[i].location[j].value === query.location) {
            productList.push(productListArr[i]);
          }
        }
      }
    } else {
      productList = await Product.find({ isFeatured: true }).populate('category');
    }

    return { productList, isFalsy: !productList };
  }

  async getRecentlyViewed(query) {
    const productList = await RecentlyViewd.find(query).populate('category');
    return { productList, isFalsy: !productList };
  }

  async addRecentlyViewed(body) {
    const findProduct = await RecentlyViewd.find({ prodId: body.id });

    if (findProduct.length === 0) {
      let product = new RecentlyViewd({
        prodId: body.id,
        name: body.name,
        description: body.description,
        images: body.images,
        brand: body.brand,
        price: body.price,
        oldPrice: body.oldPrice,
        subCatId: body.subCatId,
        catName: body.catName,
        subCat: body.subCat,
        category: body.category,
        countInStock: body.countInStock,
        rating: body.rating,
        isFeatured: body.isFeatured,
        discount: body.discount,
        productRam: body.productRam,
        size: body.size,
        productWeight: body.productWeight,
      });

      product = await product.save();
      return { product, isFalsy: !product };
    }

    return null;
  }

  async create(body) {
    const category = await Category.findById(body.category);
    if (!category) {
      const error = new Error('invalid Category!');
      error.statusCode = 404;
      error.payload = 'invalid Category!';
      error.isPlainText = true;
      throw error;
    }

    const images_Array = [];
    const uploadedImages = await ImageUpload.find();

    uploadedImages?.map((item) => {
      item.images?.map((image) => {
        images_Array.push(image);
      });
    });

    validateProductPayload(body, images_Array);

    let product = new Product(mapProductBody(body, images_Array));
    product = await product.save();
    await promoDiscountsService.syncFromProduct(product);
    product = await Product.findById(product._id);

    return { product, isFalsy: !product };
  }

  async bulkDelete(ids) {
    if (!ids.length) {
      const error = new Error('No product IDs provided.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    for (const id of ids) {
      const product = await Product.findById(id);
      if (!product) continue;
      for (const img of product.images || []) {
        const imageName = getImageNameFromUrl(img);
        if (imageName) {
          cloudinary.uploader.destroy(imageName, () => {});
        }
      }
      await Product.findByIdAndDelete(id);
      const myListItems = await MyList.find({ productId: id });
      for (const item of myListItems) await MyList.findByIdAndDelete(item.id);
      const cartItems = await Cart.find({ productId: id });
      for (const item of cartItems) await Cart.findByIdAndDelete(item.id);
    }

    return { success: true, message: 'Products deleted.' };
  }

  async bulkStatus(ids, statusInput) {
    const status = statusInput === 'inactive' ? 'inactive' : 'active';
    if (!ids.length) {
      const error = new Error('No product IDs provided.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    await Product.updateMany({ _id: { $in: ids } }, { status });
    return {
      success: true,
      message: `Products ${status === 'active' ? 'activated' : 'disabled'}.`,
    };
  }

  async getById(id) {
    const product = await Product.findById(id).populate('category');
    return { product, isFalsy: !product };
  }

  async deleteImage(imgUrl) {
    const imageName = getImageNameFromUrl(imgUrl);
    return cloudinary.uploader.destroy(imageName, (error, result) => {});
  }

  async remove(id) {
    const product = await Product.findById(id);
    const images = product.images;

    for (const img of images) {
      const imageName = getImageNameFromUrl(img);
      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {});
      }
    }

    await promoDiscountsService.removeBySourceProductId(id);

    const deletedProduct = await Product.findByIdAndDelete(id);

    const myListItems = await MyList.find({ productId: id });
    for (var i = 0; i < myListItems.length; i++) {
      await MyList.findByIdAndDelete(myListItems[i].id);
    }

    const cartItems = await Cart.find({ productId: id });
    for (var j = 0; j < cartItems.length; j++) {
      await Cart.findByIdAndDelete(cartItems[j].id);
    }

    return { deletedProduct, isFalsy: !deletedProduct };
  }

  async update(id, body) {
    const previous = await Product.findById(id);

    if (body.category || body.catId) {
      const categoryId = body.category || body.catId;
      const category = await Category.findById(categoryId);
      if (!category) {
        const error = new Error('invalid Category!');
        error.statusCode = 404;
        error.payload = 'invalid Category!';
        error.isPlainText = true;
        throw error;
      }
    }

    validateProductPayload(body, body.images || []);

    const product = await Product.findByIdAndUpdate(
      id,
      mapProductBody(body, body.images || []),
      { new: true }
    );

    if (product) {
      const pricingChanged =
        !previous ||
        Number(previous.price) !== Number(product.price) ||
        Number(previous.oldPrice) !== Number(product.oldPrice) ||
        Number(previous.discount) !== Number(product.discount) ||
        Number(previous.discountPrice) !== Number(product.discountPrice) ||
        String(previous.discountType || '') !== String(product.discountType || '');

      if (pricingChanged) {
        await promoDiscountsService.syncFromProduct(product);
      }
    }

    const refreshed = product ? await Product.findById(product._id) : null;

    return { product: refreshed, isFalsy: !refreshed };
  }

  async removeVariantOption(productId, optionId) {
    const product = await Product.findById(productId);

    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    let groupIndex = -1;
    let optionIndex = -1;
    let removedOption = null;

    for (let gi = 0; gi < (product.variants || []).length; gi += 1) {
      const options = product.variants[gi]?.options || [];
      const oi = options.findIndex((opt) => String(opt._id) === String(optionId));
      if (oi >= 0) {
        groupIndex = gi;
        optionIndex = oi;
        removedOption = options[oi];
        break;
      }
    }

    if (!removedOption) {
      const error = new Error('Variant option not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const variantSku = String(removedOption.sku || '').trim();
    if (variantSku) {
      const cartCount = await Cart.countDocuments({
        productId: String(productId),
        variantSku,
      });
      if (cartCount > 0) {
        const error = new Error('Cannot remove a variant that exists in customer carts.');
        error.statusCode = 400;
        error.payload = { success: false, message: error.message };
        throw error;
      }
    }

    if (removedOption.image) {
      await this.deleteImage(removedOption.image);
    }

    product.variants[groupIndex].options.splice(optionIndex, 1);

    if (!(product.variants[groupIndex].options || []).length) {
      product.variants.splice(groupIndex, 1);
    }

    product.markModified('variants');
    await product.save();
    await promoDiscountsService.syncFromProduct(product);

    const refreshed = await Product.findById(productId);

    return {
      success: true,
      message: 'Variant option removed.',
      product: refreshed,
    };
  }
}

module.exports = new ProductService();
