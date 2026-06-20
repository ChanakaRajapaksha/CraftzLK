const mongoose = require("mongoose");

const popularCategoryItemSchema = mongoose.Schema(
  {
    categoryId: { type: String, default: "" },
    categoryName: { type: String, default: "" },
    image: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const homepageContentSchema = mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    featuredProducts: {
      enabled: { type: Boolean, default: true },
      productIds: [{ type: String }],
      productNames: [{ type: String }],
    },
    trendingProducts: {
      enabled: { type: Boolean, default: true },
      productIds: [{ type: String }],
      productNames: [{ type: String }],
    },
    newArrivals: {
      enabled: { type: Boolean, default: true },
      mode: { type: String, enum: ["auto", "manual"], default: "auto" },
      productIds: [{ type: String }],
      productNames: [{ type: String }],
      autoLimit: { type: Number, default: 10 },
    },
    bestSellers: {
      enabled: { type: Boolean, default: true },
      autoLimit: { type: Number, default: 10 },
    },
    popularCategories: {
      enabled: { type: Boolean, default: true },
      items: [popularCategoryItemSchema],
    },
  },
  { timestamps: true }
);

homepageContentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

homepageContentSchema.set("toJSON", { virtuals: true });

exports.HomepageContent = mongoose.model("HomepageContent", homepageContentSchema);

exports.DEFAULT_HOMEPAGE_CONTENT = {
  featuredProducts: {
    enabled: true,
    productIds: [],
    productNames: [],
  },
  trendingProducts: {
    enabled: true,
    productIds: [],
    productNames: [],
  },
  newArrivals: {
    enabled: true,
    mode: "auto",
    productIds: [],
    productNames: [],
    autoLimit: 10,
  },
  bestSellers: {
    enabled: true,
    autoLimit: 10,
  },
  popularCategories: {
    enabled: true,
    items: [],
  },
};
