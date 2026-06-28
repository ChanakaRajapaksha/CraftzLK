const { Category } = require('../models/category.js');
const { Product } = require('../models/products.js');
const { MyList } = require('../models/myList');
const { Cart } = require('../models/cart');
const { RecentlyViewd } = require('../models/recentlyViewd.js');
const { ImageUpload } = require('../models/imageUpload.js');
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

function mapProductBody(body, images = []) {
  return {
    name: body.name,
    sku: body.sku || '',
    slug: body.slug || '',
    shortDescription: body.shortDescription || '',
    description: body.description,
    images,
    brand: body.brand || '',
    price: Number(body.price) || 0,
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
    location: body.location !== '' ? body.location : 'All',
    variants: Array.isArray(body.variants) ? body.variants : [],
    customizationOptions: Array.isArray(body.customizationOptions) ? body.customizationOptions : [],
    shipping: body.shipping || {},
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

  async list(query) {
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

    let productList = [];

    if (query.page !== undefined && query.perPage !== undefined) {
      if (query.location !== undefined) {
        const productListArr = await Product.find()
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
        productList = await Product.find()
          .populate('category')
          .skip((page - 1) * perPage)
          .limit(perPage)
          .exec();
      }
    } else {
      productList = await Product.find();
    }

    return {
      products: productList,
      totalPages: totalPages,
      page: page,
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
        console.log(image);
      });
    });

    let product = new Product(mapProductBody(body, images_Array));
    product = await product.save();

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
    const product = await Product.findByIdAndUpdate(
      id,
      mapProductBody(body, body.images || []),
      { new: true }
    );

    return { product, isFalsy: !product };
  }
}

module.exports = new ProductService();
