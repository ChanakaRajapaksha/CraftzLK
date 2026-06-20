const mongoose = require("mongoose");

const promoDiscountSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["product", "category", "seasonal"], required: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, default: 0 },
    productIds: [{ type: String }],
    productNames: [{ type: String }],
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
