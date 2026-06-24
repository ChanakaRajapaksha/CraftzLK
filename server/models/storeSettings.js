const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const storeSettingsSchema = mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    general: {
      storeName: { type: String, default: "CraftzLK" },
      logo: { type: mediaAssetSchema, default: () => ({}) },
      favicon: { type: mediaAssetSchema, default: () => ({}) },
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
    logo: { url: "", publicId: "" },
    favicon: { url: "", publicId: "" },
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
};
