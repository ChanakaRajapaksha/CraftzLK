const mongoose = require("mongoose");

const cmsPageSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: "" },
    images: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    showInNav: { type: Boolean, default: true },
    pageType: { type: String, enum: ["system", "custom"], default: "custom" },
    routePath: { type: String, default: "" },
    sortOrder: { type: Number, default: 100 },
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

/** Built-in storefront pages backed by existing frontend designs. */
exports.SYSTEM_CMS_SLUGS = ["home", "shop", "categories", "gifts", "eco"];

exports.DEFAULT_CMS_PAGES = [
  {
    title: "Home",
    slug: "home",
    pageType: "system",
    routePath: "/",
    sortOrder: 1,
    content:
      "CraftzLK homepage — featured products, banners, categories, and promotional sections.",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "CraftzLK | Handmade Sri Lankan Crafts",
      metaDescription: "Discover authentic handmade, eco-friendly, and premium products from Sri Lankan artisans.",
      keywords: "craftzlk, handmade, sri lanka, home",
    },
  },
  {
    title: "Shop",
    slug: "shop",
    pageType: "system",
    routePath: "/collections/all",
    sortOrder: 2,
    content:
      "Shop all collections — browse the full CraftzLK catalog with filters and category navigation.",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "Shop All | CraftzLK",
      metaDescription: "Browse all handmade products and collections on CraftzLK.",
      keywords: "shop, collections, products, craftzlk",
    },
  },
  {
    title: "Categories",
    slug: "categories",
    pageType: "system",
    routePath: "",
    sortOrder: 3,
    content:
      "Category mega menu — browse main and sub categories from the site header navigation.",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "Categories | CraftzLK",
      metaDescription: "Explore product categories and subcategories on CraftzLK.",
      keywords: "categories, browse, collections, craftzlk",
    },
  },
  {
    title: "Gifts",
    slug: "gifts",
    pageType: "system",
    routePath: "/gifts",
    sortOrder: 4,
    content:
      "Gifts with heart and craft — curated handmade pieces, festive hampers, and gift-ready packaging.",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "Gifts | CraftzLK",
      metaDescription: "Curated handmade gifts, hampers, and gift-ready packaging from Sri Lankan artisans.",
      keywords: "gifts, hampers, craftzlk, handmade",
    },
  },
  {
    title: "Eco",
    slug: "eco",
    pageType: "system",
    routePath: "/eco",
    sortOrder: 5,
    content:
      "Eco-friendly and sustainable handmade products — conscious choices from local makers.",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "Eco | CraftzLK",
      metaDescription: "Eco-friendly and sustainable handmade products from CraftzLK artisans.",
      keywords: "eco, sustainable, handmade, craftzlk",
    },
  },
];

/** Default content pages managed through CMS (editable, deletable). */
exports.DEFAULT_CUSTOM_CMS_PAGES = [
  {
    title: "About Us",
    slug: "about",
    pageType: "custom",
    routePath: "/about",
    sortOrder: 10,
    content: "",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "About Us | CraftzLK",
      metaDescription: "Learn about CraftzLK — Sri Lanka's marketplace for handmade and artisan products.",
      keywords: "about, craftzlk, handmade, sri lanka",
    },
  },
  {
    title: "Contact",
    slug: "contact",
    pageType: "custom",
    routePath: "/contact",
    sortOrder: 11,
    content: "",
    status: "active",
    showInNav: true,
    seo: {
      metaTitle: "Contact | CraftzLK",
      metaDescription: "Contact CraftzLK for customer support, orders, and artisan enquiries.",
      keywords: "contact, support, craftzlk",
    },
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    pageType: "custom",
    routePath: "/privacy-policy",
    sortOrder: 12,
    content: "",
    status: "active",
    showInNav: false,
    seo: {
      metaTitle: "Privacy Policy | CraftzLK",
      metaDescription: "Read the CraftzLK privacy policy for data collection and usage practices.",
      keywords: "privacy, policy, data",
    },
  },
  {
    title: "Terms & Conditions",
    slug: "terms",
    pageType: "custom",
    routePath: "/terms",
    sortOrder: 13,
    content: "",
    status: "active",
    showInNav: false,
    seo: {
      metaTitle: "Terms & Conditions | CraftzLK",
      metaDescription: "CraftzLK terms and conditions for using our marketplace and placing orders.",
      keywords: "terms, conditions, legal",
    },
  },
];
