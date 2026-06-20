const mongoose = require("mongoose");

const cmsPageSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: "" },
    images: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

cmsPageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

cmsPageSchema.set("toJSON", { virtuals: true });

exports.CmsPage = mongoose.model("CmsPage", cmsPageSchema);

exports.DEFAULT_CMS_PAGES = [
  {
    title: "About Us",
    slug: "about",
    content:
      "CraftzLK is a Sri Lankan marketplace for authentic handmade, eco-friendly, and premium homestyle products — connecting skilled artisans with customers who value quality, tradition, and care.",
    status: "active",
    seo: {
      metaTitle: "About Us | CraftzLK",
      metaDescription: "Learn about CraftzLK — Sri Lanka's marketplace for handmade and artisan products.",
      keywords: "about, craftzlk, handmade, sri lanka",
    },
  },
  {
    title: "Contact",
    slug: "contact",
    content:
      "We'd love to hear from you. Reach us via WhatsApp at 0715264449 or email hello@craftzlk.com for orders, artisan partnerships, and support.",
    status: "active",
    seo: {
      metaTitle: "Contact | CraftzLK",
      metaDescription: "Contact CraftzLK for customer support, orders, and artisan enquiries.",
      keywords: "contact, support, craftzlk",
    },
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    content:
      "This Privacy Policy explains how CraftzLK collects, uses, and protects your personal information when you use our website and services.",
    status: "active",
    seo: {
      metaTitle: "Privacy Policy | CraftzLK",
      metaDescription: "Read the CraftzLK privacy policy for data collection and usage practices.",
      keywords: "privacy, policy, data",
    },
  },
  {
    title: "Terms & Conditions",
    slug: "terms",
    content:
      "These Terms & Conditions govern your use of the CraftzLK website, purchases, and related services. By using our platform you agree to these terms.",
    status: "active",
    seo: {
      metaTitle: "Terms & Conditions | CraftzLK",
      metaDescription: "CraftzLK terms and conditions for using our marketplace and placing orders.",
      keywords: "terms, conditions, legal",
    },
  },
];
