const mongoose = require("mongoose");

const notificationSettingsSchema = mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    email: {
      enabled: { type: Boolean, default: true },
      fromName: { type: String, default: "CraftzLK" },
      fromEmail: { type: String, default: "" },
      replyTo: { type: String, default: "" },
      emailPasswordEncrypted: { type: String, default: "" },
    },
    sms: {
      enabled: { type: Boolean, default: true },
      senderId: { type: String, default: "CraftzLK" },
      provider: { type: String, default: "" },
    },
    templateMigrationVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

notificationSettingsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

notificationSettingsSchema.set("toJSON", { virtuals: true });

exports.NotificationSettings = mongoose.model("NotificationSettings", notificationSettingsSchema);

exports.DEFAULT_NOTIFICATION_SETTINGS = {
  key: "default",
  email: {
    enabled: true,
    fromName: "CraftzLK",
    fromEmail: "hellocraftzlk@gmail.com",
    replyTo: "hellocraftzlk@gmail.com",
  },
  sms: {
    enabled: true,
    senderId: "CraftzLK",
    provider: "",
  },
};
