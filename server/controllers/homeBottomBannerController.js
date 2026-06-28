const homeBottomBannerService = require('../services/homeBottomBannerService');

let imagesArr = [];

class HomeBottomBannerController {
  async upload(req, res) {
    imagesArr = [];

    try {
      imagesArr = await homeBottomBannerService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  }

  async list(_req, res) {
    try {
      const bannerList = await homeBottomBannerService.list();
      return res.status(200).json(bannerList);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async getById(req, res) {
    try {
      const slide = await homeBottomBannerService.getById(req.params.id);
      return res.status(200).send(slide);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async create(req, res) {
    const { entry, clearedImages } = await homeBottomBannerService.create(req.body, imagesArr);
    imagesArr = clearedImages;
    return res.status(201).json(entry);
  }

  async deleteImage(req, res) {
    const response = await homeBottomBannerService.deleteImage(req.query.img);

    if (response) {
      return res.status(200).send(response);
    }
  }

  async remove(req, res) {
    const result = await homeBottomBannerService.remove(req.params.id);
    return res.status(200).json(result);
  }

  async update(req, res) {
    const { entry, clearedImages } = await homeBottomBannerService.update(req.params.id, req.body);
    imagesArr = clearedImages;
    return res.send(entry);
  }
}

module.exports = new HomeBottomBannerController();
