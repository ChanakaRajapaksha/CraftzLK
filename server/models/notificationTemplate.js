const mongoose = require("mongoose");
const { DEFAULT_NOTIFICATION_TEMPLATES } = require("../constants/emailTemplateDefaults");

const notificationTemplateSchema = mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    channel: { type: String, enum: ["email", "sms"], required: true },
    category: { type: String, default: "general" },
    description: { type: String, default: "" },
    placeholders: { type: [String], default: [] },
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
exports.DEFAULT_NOTIFICATION_TEMPLATES = DEFAULT_NOTIFICATION_TEMPLATES;
