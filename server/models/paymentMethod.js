const mongoose = require("mongoose");

const paymentMethodSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      enum: ["cod", "bank_transfer"],
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    bankName: { type: String, default: "" },
    branchName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

paymentMethodSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

paymentMethodSchema.set("toJSON", { virtuals: true });

exports.PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
