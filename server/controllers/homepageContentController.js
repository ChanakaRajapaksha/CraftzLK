const homepageContentService = require("../services/homepageContentService");

class HomepageContentController {
  async upload(req, res) {
    try {
      const imagesArr = await homepageContentService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false });
    }
  }

  async deleteImage(req, res) {
    const response = await homepageContentService.deleteImage(req.query.img);

    if (response) {
      return res.status(200).send(response);
    }
  }

  async get(_req, res) {
    try {
      const content = await homepageContentService.get();
      return res.status(200).json({ success: true, content });
    } catch {
      return res.status(500).json({ success: false, message: "Failed to load homepage content." });
    }
  }

  async update(req, res) {
    try {
      const content = await homepageContentService.update(req.body || {});
      return res.status(200).json({ success: true, content });
    } catch {
      return res.status(500).json({ success: false, message: "Failed to update homepage content." });
    }
  }

  async getFeaturedProducts(_req, res) {
    try {
      const result = await homepageContentService.getFeaturedProducts();
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getTrendingProducts(_req, res) {
    try {
      const result = await homepageContentService.getTrendingProducts();
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getNewArrivals(_req, res) {
    try {
      const result = await homepageContentService.getNewArrivals();
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getBestSellers(_req, res) {
    try {
      const result = await homepageContentService.getBestSellers();
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getPopularCategories(_req, res) {
    try {
      const result = await homepageContentService.getPopularCategories();
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ success: false });
    }
  }
}

module.exports = new HomepageContentController();
