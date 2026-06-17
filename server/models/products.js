const mongoose = require("mongoose");

const variantOptionSchema = mongoose.Schema({
  label: { type: String, default: "" },
  sku: { type: String, default: "" },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  image: { type: String, default: "" },
});

const variantGroupSchema = mongoose.Schema({
  variantName: { type: String, default: "" },
  options: [variantOptionSchema],
});

const customizationOptionSchema = mongoose.Schema({
  name: { type: String, default: "" },
  type: { type: String, enum: ["text", "dropdown", "checkbox", "file"], default: "text" },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
});

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, default: "" },
  slug: { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  brand: { type: String, default: "" },
  price: { type: Number, default: 0 },
  oldPrice: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  catName: { type: String, default: "" },
  catId: { type: String, default: "" },
  subCatId: { type: String, default: "" },
  subCat: { type: String, default: "" },
  subCatName: { type: String, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  countInStock: { type: Number, required: true },
  stockStatus: { type: String, enum: ["in_stock", "out_of_stock", "pre_order"], default: "in_stock" },
  minStockAlert: { type: Number, default: 5 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  rating: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  discount: { type: Number, required: true },
  productRam: [{ type: String, default: null }],
  size: [{ type: String, default: null }],
  productWeight: [{ type: String, default: null }],
  location: [{ value: { type: String }, label: { type: String } }],
  variants: [variantGroupSchema],
  customizationOptions: [customizationOptionSchema],
  shipping: {
    weight: { type: Number, default: 0 },
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    freeShipping: { type: Boolean, default: false },
    shippingCharge: { type: Number, default: 0 },
  },
  seo: {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
  },
  dateCreated: { type: Date, default: Date.now },
});

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", { virtuals: true });

exports.Product = mongoose.model("Product", productSchema);
