const mongoose = require("mongoose");

const stockAdjustmentSchema = mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, default: "" },
    action: { type: String, enum: ["add", "remove"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, default: "" },
    previousStock: { type: Number, default: 0 },
    newStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

stockAdjustmentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

stockAdjustmentSchema.set("toJSON", { virtuals: true });

exports.StockAdjustment = mongoose.model("StockAdjustment", stockAdjustmentSchema);
