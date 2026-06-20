const mongoose = require("mongoose");

const homeSliderBannerSchema = mongoose.Schema(
  {
    heading: { type: String, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    buttonText: { type: String, default: "Shop Now" },
    buttonUrl: { type: String, default: "" },
    link: { type: String, default: "" },
    desktopImage: { type: String, default: "" },
    mobileImage: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

homeSliderBannerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

homeSliderBannerSchema.set("toJSON", { virtuals: true });

exports.HomeSliderBanner = mongoose.model("HomeSliderBanner", homeSliderBannerSchema);
