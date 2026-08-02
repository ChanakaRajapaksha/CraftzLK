const mongoose = require("mongoose");

const variantTargetSchema = mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, default: "" },
    variantName: { type: String, default: "" },
    optionLabel: { type: String, default: "" },
    optionId: { type: String, default: "" },
    originalPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const appliedVariantSnapshotSchema = mongoose.Schema(
  {
    variantName: { type: String, default: "" },
    optionLabel: { type: String, default: "" },
    optionId: { type: String, default: "" },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const appliedSnapshotSchema = mongoose.Schema(
  {
    productId: { type: String, required: true },
    price: { type: Number, default: 0 },
    oldPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    discountType: { type: String, default: "percentage" },
    variants: [appliedVariantSnapshotSchema],
  },
  { _id: false }
);

const promoDiscountSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["product", "category", "seasonal"], required: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, default: 0 },
    productIds: [{ type: String }],
    productNames: [{ type: String }],
    variantTargets: [variantTargetSchema],
    appliedSnapshots: [appliedSnapshotSchema],
    source: { type: String, enum: ["promo_module", "product_form"], default: "promo_module" },
    sourceProductId: { type: String, default: "" },
    categoryId: { type: String, default: "" },
    categoryName: { type: String, default: "" },
    description: { type: String, default: "" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ["active", "inactive", "scheduled", "expired"], default: "active" },
  },
  { timestamps: true }
);

promoDiscountSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

promoDiscountSchema.set("toJSON", { virtuals: true });

exports.PromoDiscount = mongoose.model("PromoDiscount", promoDiscountSchema);
