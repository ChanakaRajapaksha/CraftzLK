const mongoose = require("mongoose");

const couponSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    usageLimit: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive", "expired"], default: "active" },
  },
  { timestamps: true }
);

couponSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

couponSchema.set("toJSON", { virtuals: true });

exports.Coupon = mongoose.model("Coupon", couponSchema);
