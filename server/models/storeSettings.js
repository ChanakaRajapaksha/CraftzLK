const mongoose = require("mongoose");

const storeSettingsSchema = mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    general: {
      storeName: { type: String, default: "CraftzLK" },
      logo: { type: String, default: "" },
      favicon: { type: String, default: "" },
      contactEmail: { type: String, default: "" },
      contactPhone: { type: String, default: "" },
      contactAddress: { type: String, default: "" },
    },
    currency: {
      code: { type: String, default: "LKR" },
      symbol: { type: String, default: "Rs" },
      decimalFormat: { type: String, default: "2" },
    },
    tax: {
      enabled: { type: Boolean, default: true },
      rules: { type: String, enum: ["inclusive", "exclusive", "none"], default: "exclusive" },
      percentage: { type: Number, default: 0 },
    },
    email: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUsername: { type: String, default: "" },
      smtpPassword: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

storeSettingsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

storeSettingsSchema.set("toJSON", { virtuals: true });

exports.StoreSettings = mongoose.model("StoreSettings", storeSettingsSchema);

exports.DEFAULT_STORE_SETTINGS = {
  key: "default",
  general: {
    storeName: "CraftzLK",
    logo: "",
    favicon: "",
    contactEmail: "hello@craftzlk.com",
    contactPhone: "+94 71 526 4449",
    contactAddress: "Colombo, Sri Lanka",
  },
  currency: {
    code: "LKR",
    symbol: "Rs",
    decimalFormat: "2",
  },
  tax: {
    enabled: true,
    rules: "exclusive",
    percentage: 0,
  },
  email: {
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
  },
};
