const cmsPageService = require("../services/cmsPageService");

class CmsPageController {
  async upload(req, res) {
    try {
      const imagesArr = await cmsPageService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false });
    }
  }

  async deleteImage(req, res) {
    try {
      await cmsPageService.deleteImage(req.query.img);
      return res.status(200).json({ success: true });
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async list(_req, res) {
    try {
      const pageList = await cmsPageService.list();
      return res.status(200).json({
        success: true,
        pageList,
      });
    } catch {
      return res.status(500).json({ success: false, message: "Failed to load CMS pages." });
    }
  }

  async getPublicBySlug(req, res) {
    try {
      const page = await cmsPageService.getPublicBySlug(req.params.slug);
      return res.status(200).json(page);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: "Failed to load page." }
      );
    }
  }

  async getById(req, res) {
    try {
      const page = await cmsPageService.getById(req.params.id);
      return res.status(200).json(page);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: "Failed to load page." }
      );
    }
  }

  async create(req, res) {
    try {
      const page = await cmsPageService.create(req.body);
      return res.status(201).json(page);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      return res.status(500).json({ success: false, message: "Failed to create page." });
    }
  }

  async update(req, res) {
    try {
      const page = await cmsPageService.update(req.params.id, req.body);
      return res.status(200).json(page);
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: "Failed to update page." });
    }
  }

  async remove(req, res) {
    try {
      const result = await cmsPageService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: "Failed to delete page." }
      );
    }
  }
}

module.exports = new CmsPageController();
