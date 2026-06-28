const fs = require("fs");
const { ImageUpload } = require("../models/imageUpload");
const { CmsPage, DEFAULT_CMS_PAGES } = require("../models/cmsPage");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

class CmsPageService {
  mapPage(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      content: doc.content || "",
      images: doc.images || [],
      status: doc.status || "active",
      seo: doc.seo || {},
      dateCreated: doc.createdAt,
      dateUpdated: doc.updatedAt,
    };
  }

  async ensureDefaultPages() {
    const count = await CmsPage.countDocuments();
    if (count > 0) return;
    await CmsPage.insertMany(DEFAULT_CMS_PAGES);
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
    await this.ensureDefaultPages();
    const list = await CmsPage.find().sort({ title: 1 });
    return list.map((doc) => this.mapPage(doc));
  }

  async getPublicBySlug(slug) {
    const page = await CmsPage.findOne({ slug, status: "active" });
    if (!page) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return this.mapPage(page);
  }

  async getById(id) {
    const page = await CmsPage.findById(id);
    if (!page) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return this.mapPage(page);
  }

  async create(body) {
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
      content: body.content || "",
      images: body.images || [],
      status: body.status || "active",
      seo: body.seo || {},
    });
    const saved = await page.save();
    return this.mapPage(saved);
  }

  async update(id, body) {
    const duplicate = await CmsPage.findOne({
      slug: body.slug,
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
        slug: body.slug,
        content: body.content || "",
        images: body.images || [],
        status: body.status || "active",
        seo: body.seo || {},
      },
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

  async remove(id) {
    const deleted = await CmsPage.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error("Page not found.");
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return { success: true, message: "Page deleted." };
  }
}

module.exports = new CmsPageService();
