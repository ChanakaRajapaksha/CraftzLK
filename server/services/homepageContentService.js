const fs = require("fs");
const {
  HomepageContent,
  DEFAULT_HOMEPAGE_CONTENT,
} = require("../models/homepageContent");
const { Product } = require("../models/products");
const { Orders } = require("../models/orders");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

class HomepageContentService {
  mapContent(doc) {
    const data = doc.toObject ? doc.toObject() : doc;
    return {
      _id: data._id,
      id: data._id,
      featuredProducts: data.featuredProducts || DEFAULT_HOMEPAGE_CONTENT.featuredProducts,
      trendingProducts: data.trendingProducts || DEFAULT_HOMEPAGE_CONTENT.trendingProducts,
      newArrivals: data.newArrivals || DEFAULT_HOMEPAGE_CONTENT.newArrivals,
      bestSellers: data.bestSellers || DEFAULT_HOMEPAGE_CONTENT.bestSellers,
      popularCategories: data.popularCategories || DEFAULT_HOMEPAGE_CONTENT.popularCategories,
      updatedAt: data.updatedAt,
    };
  }

  async getOrCreateContent() {
    let doc = await HomepageContent.findOne({ key: "default" });
    if (!doc) {
      doc = await HomepageContent.create({
        key: "default",
        ...DEFAULT_HOMEPAGE_CONTENT,
      });
    }
    return doc;
  }

  async resolveProductsByIds(ids) {
    if (!ids?.length) return [];
    const products = await Product.find({ _id: { $in: ids } }).populate("category");
    const map = new Map(products.map((p) => [String(p._id), p]));
    return ids.map((id) => map.get(String(id))).filter(Boolean);
  }

  async getBestSellerIds(limit = 10) {
    const orders = await Orders.find({
      paymentStatus: "paid",
      status: { $nin: ["cancelled", "returned"] },
    });

    const sales = {};
    orders.forEach((order) => {
      (order.products || []).forEach((item) => {
        const id = String(item.productId || "");
        if (!id) return;
        sales[id] = (sales[id] || 0) + Number(item.quantity || 1);
      });
    });

    return Object.entries(sales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }

  async upload(files) {
    const imagesArr = [];

    for (let i = 0; i < files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(
        files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${files[i].filename}`);
        }
      );
    }

    return imagesArr;
  }

  async deleteImage(imgUrl) {
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];
    return cloudinary.uploader.destroy(imageName, () => {});
  }

  async get() {
    const doc = await this.getOrCreateContent();
    return this.mapContent(doc);
  }

  async update(body) {
    const doc = await this.getOrCreateContent();

    if (body.featuredProducts) doc.featuredProducts = body.featuredProducts;
    if (body.trendingProducts) doc.trendingProducts = body.trendingProducts;
    if (body.newArrivals) doc.newArrivals = body.newArrivals;
    if (body.bestSellers) doc.bestSellers = body.bestSellers;
    if (body.popularCategories) doc.popularCategories = body.popularCategories;

    await doc.save();
    return this.mapContent(doc);
  }

  async getFeaturedProducts() {
    const doc = await this.getOrCreateContent();
    if (!doc.featuredProducts?.enabled) {
      return { products: [] };
    }
    const products = await this.resolveProductsByIds(doc.featuredProducts.productIds || []);
    return { products };
  }

  async getTrendingProducts() {
    const doc = await this.getOrCreateContent();
    if (!doc.trendingProducts?.enabled) {
      return { products: [] };
    }
    const products = await this.resolveProductsByIds(doc.trendingProducts.productIds || []);
    return { products };
  }

  async getNewArrivals() {
    const doc = await this.getOrCreateContent();
    if (!doc.newArrivals?.enabled) {
      return { products: [] };
    }

    if (doc.newArrivals.mode === "manual") {
      const products = await this.resolveProductsByIds(doc.newArrivals.productIds || []);
      return { products, mode: "manual" };
    }

    const limit = Number(doc.newArrivals.autoLimit) || 10;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category");
    return { products, mode: "auto" };
  }

  async getBestSellers() {
    const doc = await this.getOrCreateContent();
    if (!doc.bestSellers?.enabled) {
      return { products: [] };
    }

    const limit = Number(doc.bestSellers.autoLimit) || 10;
    const ids = await this.getBestSellerIds(limit);
    const products = await this.resolveProductsByIds(ids);
    return { products, mode: "auto" };
  }

  async getPopularCategories() {
    const doc = await this.getOrCreateContent();
    if (!doc.popularCategories?.enabled) {
      return { items: [] };
    }

    const items = [...(doc.popularCategories.items || [])].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    return { items };
  }
}

module.exports = new HomepageContentService();
