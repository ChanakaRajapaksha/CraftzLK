const fs = require("fs");
const { ImageUpload } = require("../models/imageUpload");
const {
  CmsPage,
  SYSTEM_CMS_SLUGS,
  DEFAULT_CMS_PAGES,
  DEFAULT_CUSTOM_CMS_PAGES,
} = require("../models/cmsPage");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const RESERVED_CMS_SLUGS = new Set([
  ...SYSTEM_CMS_SLUGS,
  "collections",
  "products",
  "product",
  "cart",
  "signin",
  "signup",
  "orders",
  "checkout",
  "search",
  "dashboard",
  "my-account",
  "my-list",
  "compare",
  "thank-you",
]);

const COMING_SOON_PLACEHOLDER = "";

function resolvePagePath(doc) {
  if (doc?.routePath) return doc.routePath;
  if (doc?.slug === "home") return "/";
  if (!doc?.slug) return "/";
  return `/${doc.slug}`;
}

function isComingSoonContent(content, pageType) {
  if (pageType === "system") return false;
  return !String(content || "").trim();
}

class CmsPageService {
  mapPage(doc) {
    const content = doc.content || "";
    const pageType = doc.pageType || "custom";
    return {
      _id: doc._id,
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      content,
      images: doc.images || [],
      status: doc.status || "active",
      showInNav: doc.showInNav !== false,
      pageType,
      isSystem: pageType === "system",
      routePath: doc.routePath || "",
      sortOrder: doc.sortOrder ?? 100,
      path: resolvePagePath(doc),
      isComingSoon: isComingSoonContent(content, pageType),
      seo: doc.seo || {},
      dateCreated: doc.createdAt,
      dateUpdated: doc.updatedAt,
    };
  }

  assertAdmin(authUser) {
    if (authUser?.role !== "admin") {
      const error = new Error("Insufficient permissions.");
      error.statusCode = 403;
      error.payload = { success: false, message: error.message };
      throw error;
    }
  }

  assertAllowedSlug(slug) {
    const normalized = String(slug || "").trim().toLowerCase();
    if (RESERVED_CMS_SLUGS.has(normalized)) {
      const error = new Error("This slug is reserved for a built-in storefront page.");
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }
  }

  async ensureDefaultPages() {
    const allDefaults = [...DEFAULT_CMS_PAGES, ...DEFAULT_CUSTOM_CMS_PAGES];

    for (const defaults of allDefaults) {
      const existing = await CmsPage.findOne({ slug: defaults.slug });
      if (!existing) {
        await CmsPage.create(defaults);
        continue;
      }

      if (defaults.pageType === "system") {
        await CmsPage.updateOne(
          { _id: existing._id },
          {
            $set: {
              pageType: "system",
              routePath: defaults.routePath,
              sortOrder: defaults.sortOrder,
            },
          }
        );
      }
    }
  }

  async preparePages() {
    await this.ensureDefaultPages();
  }

  async upload(files) {
    const imagesArr = [];

    for (let i = 0; i < files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(files[i].path, options, function (_error, result) {
        imagesArr.push(result.secure_url);
        fs.unlinkSync(`uploads/${files[i].filename}`);
      });
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return imagesArr;
  }

  async deleteImage(imgUrl) {
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];
    return cloudinary.uploader.destroy(imageName, () => {});
  }

  async list() {
    await this.preparePages();
    const list = await CmsPage.find().sort({ sortOrder: 1, title: 1 });
    return list.map((doc) => this.mapPage(doc));
  }

  async listPublic() {
    await this.preparePages();
    const list = await CmsPage.find({ status: "active" }).sort({ sortOrder: 1, title: 1 });
    return list.map((doc) => this.mapPage(doc));
  }

  async listPublicNav() {
    const pages = await this.listPublic();
    return pages.filter((page) => page.showInNav);
  }

  async getPublicBySlug(slug) {
    await this.preparePages();
    const page = await CmsPage.findOne({ slug, status: "active", pageType: "custom" });
    if (!page) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return this.mapPage(page);
  }

  async getById(id) {
    await this.preparePages();
    const page = await CmsPage.findById(id);
    if (!page) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return this.mapPage(page);
  }

  async create(body, authUser) {
    this.assertAdmin(authUser);
    this.assertAllowedSlug(body.slug);

    const existing = await CmsPage.findOne({ slug: body.slug });
    if (existing) {
      const error = new Error("Slug already exists.");
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const page = new CmsPage({
      title: body.title,
      slug: body.slug,
      content: body.content || COMING_SOON_PLACEHOLDER,
      images: body.images || [],
      status: body.status || "active",
      showInNav: body.showInNav !== false,
      pageType: "custom",
      routePath: body.slug ? `/${body.slug}` : "",
      sortOrder: 100,
      seo: body.seo || {},
    });
    const saved = await page.save();
    return this.mapPage(saved);
  }

  async update(id, body, authUser) {
    this.assertAdmin(authUser);

    const existing = await CmsPage.findById(id);
    if (!existing) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const nextSlug = existing.pageType === "system" ? existing.slug : body.slug;
    if (existing.pageType !== "system") {
      this.assertAllowedSlug(nextSlug);
    }

    const duplicate = await CmsPage.findOne({
      slug: nextSlug,
      _id: { $ne: id },
    });
    if (duplicate) {
      const error = new Error("Slug already exists.");
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const updated = await CmsPage.findByIdAndUpdate(
      id,
      {
        title: body.title,
        slug: nextSlug,
        content: body.content || "",
        images: body.images || [],
        status: body.status || "active",
        showInNav: body.showInNav !== false,
        routePath: existing.pageType === "system" ? existing.routePath : `/${nextSlug}`,
        seo: body.seo || {},
      },
      { new: true }
    );

    return this.mapPage(updated);
  }

  async updateStatus(id, status, authUser) {
    this.assertAdmin(authUser);

    if (!["active", "inactive"].includes(status)) {
      const error = new Error("Status must be active or inactive.");
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const updated = await CmsPage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return this.mapPage(updated);
  }

  async remove(id, authUser) {
    this.assertAdmin(authUser);

    const existing = await CmsPage.findById(id);
    if (!existing) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (existing.pageType === "system") {
      const error = new Error("Built-in storefront pages cannot be deleted.");
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    await CmsPage.findByIdAndDelete(id);
    return { success: true, message: "Page deleted." };
  }
}

module.exports = new CmsPageService();
