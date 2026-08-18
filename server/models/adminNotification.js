const mongoose = require("mongoose");

const adminNotificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["order", "stock", "customer", "payment", "review", "system"],
      default: "system",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

adminNotificationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

adminNotificationSchema.set("toJSON", { virtuals: true });

exports.AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
