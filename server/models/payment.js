const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "LKR",
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "success", "failed", "cancelled", "chargedback"],
    default: "pending",
  },
  userId: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: false,
  },
  cardHolderName: {
    type: String,
    required: false,
  },
  cardNo: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

paymentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

paymentSchema.set("toJSON", {
  virtuals: true,
});

exports.Payment = mongoose.model("Payment", paymentSchema);
exports.paymentSchema = paymentSchema;
