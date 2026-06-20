const { ProductReviews } = require("../models/productReviews");
const { Product } = require("../models/products");
const express = require("express");
const router = express.Router();

async function buildProductNameMap(reviews) {
  const productIds = [...new Set(reviews.map((r) => String(r.productId || "")).filter(Boolean))];
  if (!productIds.length) return new Map();

  const products = await Product.find({ _id: { $in: productIds } });
  return new Map(products.map((p) => [String(p._id), p.name]));
}

function mapReview(review, productNameMap = new Map()) {
  const id = String(review._id);
  return {
    _id: review._id,
    id: review._id,
    customerId: review.customerId,
    customerName: review.customerName,
    productId: review.productId,
    productName: review.productName || productNameMap.get(String(review.productId)) || "",
    review: review.review || "",
    comment: review.review || "",
    rating: review.customerRating,
    customerRating: review.customerRating,
    status: review.status || "pending",
    date: review.dateCreated,
    dateCreated: review.dateCreated,
  };
}

router.get(`/`, async (req, res) => {
  try {
    const hasProductId =
      req.query.productId !== undefined &&
      req.query.productId !== null &&
      req.query.productId !== "";

    let reviews = [];
    if (hasProductId) {
      reviews = await ProductReviews.find({ productId: req.query.productId }).sort({
        dateCreated: -1,
      });
      reviews = reviews.filter(
        (item) => !item.status || item.status === "approved"
      );
      return res.status(200).json(reviews);
    }

    reviews = await ProductReviews.find().sort({ dateCreated: -1 });
    const productNameMap = await buildProductNameMap(reviews);

    return res.status(200).json({
      success: true,
      reviewList: reviews.map((item) => mapReview(item, productNameMap)),
    });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get(`/get/count`, async (req, res) => {
  try {
    const productsReviews = await ProductReviews.countDocuments();
    return res.send({ productsReviews });
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await ProductReviews.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "The review with the given ID was not found." });
    }
    const productNameMap = await buildProductNameMap([review]);
    return res.status(200).json(mapReview(review, productNameMap));
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.post("/add", async (req, res) => {
  try {
    let productName = req.body.productName || "";
    if (!productName && req.body.productId) {
      const product = await Product.findById(req.body.productId);
      productName = product?.name || "";
    }

    let review = new ProductReviews({
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      review: req.body.review,
      customerRating: req.body.customerRating,
      productId: req.body.productId,
      productName,
      status: "pending",
    });

    review = await review.save();
    return res.status(201).json(mapReview(review));
  } catch {
    return res.status(500).json({ success: false });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const status = req.body.status;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const updated = await ProductReviews.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    const productNameMap = await buildProductNameMap([updated]);
    return res.status(200).json(mapReview(updated, productNameMap));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update review status." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ProductReviews.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }
    return res.status(200).json({ success: true, message: "Review deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete review." });
  }
});

module.exports = router;
