const mongoose = require("mongoose");

const notificationTemplateSchema = mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    channel: { type: String, enum: ["email", "sms"], required: true },
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

notificationTemplateSchema.index({ code: 1, channel: 1 }, { unique: true });

notificationTemplateSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

notificationTemplateSchema.set("toJSON", { virtuals: true });

exports.NotificationTemplate = mongoose.model("NotificationTemplate", notificationTemplateSchema);

exports.DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    code: "order_confirmation",
    name: "Order Confirmation",
    channel: "email",
    subject: "Order Confirmation — CraftzLK",
    body: "Hello {{customerName}},\n\nYour order #{{orderNumber}} has been received.\n\nThank you for shopping with CraftzLK.",
    status: "active",
  },
  {
    code: "order_confirmation",
    name: "Order Confirmation",
    channel: "sms",
    subject: "",
    body: "Your order #{{orderNumber}} has been received. — CraftzLK",
    status: "active",
  },
  {
    code: "order_shipped",
    name: "Order Shipped",
    channel: "email",
    subject: "Your order is on the way",
    body: "Hello {{customerName}},\n\nYour order #{{orderNumber}} has been shipped.",
    status: "active",
  },
  {
    code: "order_shipped",
    name: "Order Shipped",
    channel: "sms",
    subject: "",
    body: "Your order #{{orderNumber}} has been shipped. — CraftzLK",
    status: "active",
  },
  {
    code: "order_delivered",
    name: "Order Delivered",
    channel: "email",
    subject: "Order delivered",
    body: "Hello {{customerName}},\n\nYour order #{{orderNumber}} has been delivered. We hope you enjoy your purchase!",
    status: "active",
  },
  {
    code: "order_delivered",
    name: "Order Delivered",
    channel: "sms",
    subject: "",
    body: "Your order #{{orderNumber}} has been delivered. Thank you! — CraftzLK",
    status: "active",
  },
];
