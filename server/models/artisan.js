const mongoose = require("mongoose");

const artisanSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    images: [
      {
        type: String,
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    story: {
      type: String,
      default: "",
    },
    social: {
      website: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

artisanSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

artisanSchema.set("toJSON", {
  virtuals: true,
});

exports.Artisan = mongoose.model("Artisan", artisanSchema);
exports.artisanSchema = artisanSchema;
