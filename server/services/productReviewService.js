const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { ProductReviews } = require('../models/productReviews');
const { Product } = require('../models/products');

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

function isValidObjectId(value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return false;
  return String(new mongoose.Types.ObjectId(value)) === String(value);
}

function getImageNameFromUrl(imgUrl) {
  const urlArr = String(imgUrl || '').split('/');
  const image = urlArr[urlArr.length - 1] || '';
  return image.split('.')[0];
}

function normalizeImages(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

async function buildProductNameMap(reviews) {
  const productIds = [
    ...new Set(
      reviews
        .filter((review) => !review.productName)
        .map((review) => String(review.productId || ''))
        .filter(Boolean)
        .filter(isValidObjectId)
    ),
  ];

  if (!productIds.length) return new Map();

  const products = await Product.find({ _id: { $in: productIds } });
  return new Map(products.map((product) => [String(product._id), product.name]));
}

async function buildProductInfoMap(reviews) {
  const productIds = [
    ...new Set(
      reviews
        .map((review) => String(review.productId || ''))
        .filter(Boolean)
        .filter(isValidObjectId)
    ),
  ];

  if (!productIds.length) return new Map();

  const products = await Product.find({ _id: { $in: productIds } }).select(
    'name images'
  );

  return new Map(
    products.map((product) => [
      String(product._id),
      {
        name: product.name || '',
        image: Array.isArray(product.images) ? product.images[0] || '' : '',
      },
    ])
  );
}

function mapReview(review, productNameMap = new Map()) {
  return {
    _id: review._id,
    id: review._id,
    customerId: review.customerId,
    customerName: review.customerName,
    productId: review.productId,
    productName: review.productName || productNameMap.get(String(review.productId)) || '',
    review: review.review || '',
    comment: review.review || '',
    title: review.title || '',
    email: review.email || '',
    images: normalizeImages(review.images),
    rating: review.customerRating,
    customerRating: review.customerRating,
    status: review.status || 'pending',
    date: review.dateCreated,
    dateCreated: review.dateCreated,
  };
}

function mapStorefrontReview(review) {
  return {
    _id: review._id,
    id: review._id,
    customerName: review.customerName,
    customerRating: review.customerRating,
    rating: review.customerRating,
    review: review.review || '',
    title: review.title || '',
    images: normalizeImages(review.images),
    status: review.status || 'approved',
    verified: (review.status || 'approved') === 'approved',
    dateCreated: review.dateCreated,
  };
}

function mapModalReview(review, productInfoMap = new Map()) {
  const images = normalizeImages(review.images);
  const productInfo = productInfoMap.get(String(review.productId)) || {};
  const productName =
    review.productName || productInfo.name || 'Product';
  const productImg = productInfo.image || images[0] || '';

  return {
    _id: review._id,
    id: review._id,
    name: review.customerName || 'Customer',
    customerName: review.customerName || 'Customer',
    verified: (review.status || 'pending') === 'approved',
    status: review.status || 'pending',
    date: review.dateCreated,
    dateCreated: review.dateCreated,
    stars: Number(review.customerRating || 0),
    customerRating: review.customerRating,
    rating: review.customerRating,
    title: review.title || '',
    body: review.review || '',
    review: review.review || '',
    productId: review.productId,
    product: productName,
    productName,
    productImg,
    images,
    hasPictures: images.length > 0,
    hasVideo: false,
    helpfulCount: 0,
  };
}

function computeReviewStats(reviews) {
  if (!reviews.length) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const total = reviews.reduce(
    (sum, item) => sum + Number(item.customerRating || 0),
    0
  );

  return {
    averageRating: Math.round((total / reviews.length) * 100) / 100,
    reviewCount: reviews.length,
  };
}

function computeRatingDistribution(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((item) => {
    const rating = Math.round(Number(item.customerRating || 0));
    if (rating >= 1 && rating <= 5) {
      counts[rating] += 1;
    }
  });

  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars],
  }));
}

function parsePage(value, fallback = 1) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseLimit(value, fallback = 5) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 50);
}

function parseStarFilters(value) {
  if (value == null || value === '') return [];

  const raw = Array.isArray(value) ? value : String(value).split(',');
  const stars = raw
    .map((item) => Number.parseInt(String(item).trim(), 10))
    .filter((n) => n >= 1 && n <= 5);

  return [...new Set(stars)];
}

function buildGetAllSort(sortBy) {
  switch (sortBy) {
    case 'highest':
      return { customerRating: -1, dateCreated: -1 };
    case 'lowest':
      return { customerRating: 1, dateCreated: -1 };
    case 'most_helpful':
    case 'videos_first':
    case 'recent':
    default:
      return { dateCreated: -1 };
  }
}

class ProductReviewService {
  async upload(files) {
    const imagesArr = [];

    for (let i = 0; i < files?.length; i += 1) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      // eslint-disable-next-line no-await-in-loop
      await cloudinary.uploader.upload(
        files[i].path,
        options,
        function (error, result) {
          if (result?.secure_url) {
            imagesArr.push(result.secure_url);
          }
          try {
            fs.unlinkSync(`uploads/${files[i].filename}`);
          } catch {
            // ignore local cleanup errors
          }
        }
      );
    }

    return imagesArr;
  }

  async deleteImage(imgUrl) {
    const imageName = getImageNameFromUrl(imgUrl);
    if (!imageName) return null;
    return cloudinary.uploader.destroy(imageName, () => {});
  }

  async list(query) {
    const hasProductId =
      query.productId !== undefined &&
      query.productId !== null &&
      query.productId !== '';

    if (hasProductId) {
      const reviews = await ProductReviews.find({
        productId: String(query.productId),
        status: 'approved',
      }).sort({ dateCreated: -1 });

      const stats = computeReviewStats(reviews);

      return {
        type: 'storefront',
        reviewList: reviews.map(mapStorefrontReview),
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
      };
    }

    const reviews = await ProductReviews.find().sort({ dateCreated: -1 });
    const productNameMap = await buildProductNameMap(reviews);

    return {
      type: 'admin',
      reviewList: reviews.map((item) => mapReview(item, productNameMap)),
    };
  }

  async getCount() {
    return ProductReviews.countDocuments();
  }

  async getApprovedStats(productId) {
    const filter = { status: 'approved' };
    if (productId) {
      filter.productId = String(productId);
    }

    const reviews = await ProductReviews.find(filter).select('customerRating');
    const stats = computeReviewStats(reviews);

    return {
      ...stats,
      distribution: computeRatingDistribution(reviews),
    };
  }

  async getAll(query = {}) {
    const page = parsePage(query.page, 1);
    const limit = parseLimit(query.limit ?? query.pageSize, 5);
    const search = String(query.search || query.q || '').trim();
    const starFilters = parseStarFilters(query.stars ?? query.rating);
    const sortBy = String(query.sort || query.sortBy || 'recent').trim();
    const productId =
      query.productId !== undefined &&
      query.productId !== null &&
      String(query.productId).trim() !== ''
        ? String(query.productId).trim()
        : null;

    const filter = { status: 'approved' };
    if (productId) {
      filter.productId = productId;
    }

    if (starFilters.length === 1) {
      filter.customerRating = starFilters[0];
    } else if (starFilters.length > 1) {
      filter.customerRating = { $in: starFilters };
    }

    if (sortBy === 'only_pictures') {
      filter['images.0'] = { $exists: true };
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { customerName: regex },
        { title: regex },
        { review: regex },
        { productName: regex },
      ];
    }

    const overallFilter = { status: 'approved' };
    if (productId) {
      overallFilter.productId = productId;
    }

    const [overallReviews, totalCount] = await Promise.all([
      ProductReviews.find(overallFilter).select('customerRating'),
      ProductReviews.countDocuments(filter),
    ]);

    const stats = computeReviewStats(overallReviews);
    const distribution = computeRatingDistribution(overallReviews);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    let reviews = [];

    if (sortBy === 'pictures_first') {
      reviews = await ProductReviews.aggregate([
        { $match: filter },
        {
          $addFields: {
            hasPicturesSort: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] },
                1,
                0,
              ],
            },
          },
        },
        { $sort: { hasPicturesSort: -1, dateCreated: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } else {
      reviews = await ProductReviews.find(filter)
        .sort(buildGetAllSort(sortBy))
        .skip(skip)
        .limit(limit);
    }

    const productInfoMap = await buildProductInfoMap(reviews);

    return {
      reviewList: reviews.map((item) => mapModalReview(item, productInfoMap)),
      page: safePage,
      limit,
      totalPages,
      totalCount,
      filteredCount: totalCount,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      distribution,
    };
  }

  async getById(id) {
    const review = await ProductReviews.findById(id);
    if (!review) {
      const error = new Error('The review with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    const productNameMap = await buildProductNameMap([review]);
    return mapReview(review, productNameMap);
  }

  async add(body) {
    const rating = Number(body.customerRating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      const error = new Error('A valid rating between 1 and 5 is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!String(body.review || '').trim()) {
      const error = new Error('Review content is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!String(body.productId || '').trim()) {
      const error = new Error('Product is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!String(body.customerId || '').trim()) {
      const error = new Error('Login is required to submit a review.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    let productName = body.productName || '';
    if (!productName && body.productId && isValidObjectId(body.productId)) {
      const product = await Product.findById(body.productId);
      productName = product?.name || '';
    }

    const reviewText = String(body.review).trim();
    const titleText = String(body.title || '').trim();
    const images = normalizeImages(body.images);

    let review = new ProductReviews({
      customerId: String(body.customerId),
      customerName: String(body.customerName || 'Customer').trim(),
      email: String(body.email || '').trim(),
      title: titleText,
      review: reviewText,
      customerRating: rating,
      productId: String(body.productId),
      productName,
      images,
      status: 'pending',
    });

    review = await review.save();
    return mapReview(review);
  }

  async updateStatus(id, status) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      const error = new Error('Invalid status.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const updated = await ProductReviews.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      const error = new Error('Review not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const productNameMap = await buildProductNameMap([updated]);
    return mapReview(updated, productNameMap);
  }

  async approve(id) {
    return this.updateStatus(id, 'approved');
  }

  async reject(id) {
    return this.updateStatus(id, 'rejected');
  }

  async remove(id) {
    const deleted = await ProductReviews.findById(id);
    if (!deleted) {
      const error = new Error('Review not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    for (const img of normalizeImages(deleted.images)) {
      const imageName = getImageNameFromUrl(img);
      if (imageName) {
        cloudinary.uploader.destroy(imageName, () => {});
      }
    }

    await ProductReviews.findByIdAndDelete(id);
    return { success: true, message: 'Review deleted.' };
  }
}

module.exports = new ProductReviewService();
