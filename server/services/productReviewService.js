const { ProductReviews } = require('../models/productReviews');
const { Product } = require('../models/products');

async function buildProductNameMap(reviews) {
  const productIds = [...new Set(reviews.map((r) => String(r.productId || '')).filter(Boolean))];
  if (!productIds.length) return new Map();

  const products = await Product.find({ _id: { $in: productIds } });
  return new Map(products.map((p) => [String(p._id), p.name]));
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
    rating: review.customerRating,
    customerRating: review.customerRating,
    status: review.status || 'pending',
    date: review.dateCreated,
    dateCreated: review.dateCreated,
  };
}

class ProductReviewService {
  async list(query) {
    const hasProductId =
      query.productId !== undefined &&
      query.productId !== null &&
      query.productId !== '';

    if (hasProductId) {
      let reviews = await ProductReviews.find({ productId: query.productId }).sort({
        dateCreated: -1,
      });
      reviews = reviews.filter(
        (item) => !item.status || item.status === 'approved'
      );
      return { type: 'raw', reviews };
    }

    const reviews = await ProductReviews.find().sort({ dateCreated: -1 });
    const productNameMap = await buildProductNameMap(reviews);

    return {
      type: 'mapped',
      reviewList: reviews.map((item) => mapReview(item, productNameMap)),
    };
  }

  async getCount() {
    return ProductReviews.countDocuments();
  }

  async getById(id) {
    const review = await ProductReviews.findById(id);
    if (!review) {
      const error = new Error('The review with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }
    const productNameMap = await buildProductNameMap([review]);
    return mapReview(review, productNameMap);
  }

  async add(body) {
    let productName = body.productName || '';
    if (!productName && body.productId) {
      const product = await Product.findById(body.productId);
      productName = product?.name || '';
    }

    let review = new ProductReviews({
      customerId: body.customerId,
      customerName: body.customerName,
      review: body.review,
      customerRating: body.customerRating,
      productId: body.productId,
      productName,
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

  async remove(id) {
    const deleted = await ProductReviews.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error('Review not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return { success: true, message: 'Review deleted.' };
  }
}

module.exports = new ProductReviewService();
