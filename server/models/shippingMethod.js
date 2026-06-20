const mongoose = require("mongoose");

const shippingMethodSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, default: 0 },
    deliveryTime: { type: String, default: "" },
    zones: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

shippingMethodSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

shippingMethodSchema.set("toJSON", { virtuals: true });

exports.ShippingMethod = mongoose.model("ShippingMethod", shippingMethodSchema);
