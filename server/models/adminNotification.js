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

exports.DEFAULT_ADMIN_NOTIFICATIONS = [
  {
    type: "order",
    title: "New order received",
    message: "Order #1042 was placed by Nimal Perera — Rs 12,450.",
    link: "/dashboard/orders",
    read: false,
  },
  {
    type: "stock",
    title: "Low stock alert",
    message: "Handwoven Clay Pot is down to 3 units.",
    link: "/dashboard/inventory/stock",
    read: false,
  },
  {
    type: "customer",
    title: "New customer registered",
    message: "Anuki Silva signed up via the storefront.",
    link: "/dashboard/customers",
    read: false,
  },
  {
    type: "payment",
    title: "Payment confirmed",
    message: "Bank transfer for order #1038 was marked completed.",
    link: "/dashboard/payments/transactions",
    read: true,
  },
  {
    type: "review",
    title: "New product review",
    message: "5-star review on Batik Wall Hanging — awaiting moderation.",
    link: "/dashboard/reviews",
    read: true,
  },
  {
    type: "system",
    title: "SMTP settings updated",
    message: "Email delivery settings were saved successfully.",
    link: "/dashboard/settings",
    read: true,
  },
];
