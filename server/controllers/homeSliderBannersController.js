const homeSliderBannersService = require('../services/homeSliderBannersService');

class HomeSliderBannersController {
  async upload(req, res) {
    try {
      const imagesArr = await homeSliderBannersService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false });
    }
  }

  async list(_req, res) {
    try {
      const result = await homeSliderBannersService.list();
      return res.status(200).json(result);
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load banners.' });
    }
  }

  async getById(req, res) {
    try {
      const item = await homeSliderBannersService.getById(req.params.id);
      return res.status(200).json(item);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to load banner.' }
      );
    }
  }

  async create(req, res) {
    try {
      const saved = await homeSliderBannersService.create(req.body);
      return res.status(201).json({ success: true, ...saved });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to create banner.' }
      );
    }
  }

  async update(req, res) {
    try {
      const updated = await homeSliderBannersService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, ...updated });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to update banner.' }
      );
    }
  }

  async deleteImage(req, res) {
    const response = await homeSliderBannersService.deleteImage(req.query.img);

    if (response) {
      return res.status(200).send(response);
    }
  }

  async remove(req, res) {
    try {
      const result = await homeSliderBannersService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to delete banner.' }
      );
    }
  }
}

module.exports = new HomeSliderBannersController();
