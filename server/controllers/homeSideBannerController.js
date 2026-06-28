const homeSideBannerService = require('../services/homeSideBannerService');

let imagesArr = [];

class HomeSideBannerController {
  async upload(req, res) {
    imagesArr = [];

    try {
      imagesArr = await homeSideBannerService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  }

  async list(_req, res) {
    try {
      const bannerList = await homeSideBannerService.list();
      return res.status(200).json(bannerList);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async getById(req, res) {
    try {
      const slide = await homeSideBannerService.getById(req.params.id);
      return res.status(200).send(slide);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async create(req, res) {
    const { entry, clearedImages } = await homeSideBannerService.create(req.body, imagesArr);
    imagesArr = clearedImages;
    return res.status(201).json(entry);
  }

  async deleteImage(req, res) {
    const response = await homeSideBannerService.deleteImage(req.query.img);

    if (response) {
      return res.status(200).send(response);
    }
  }

  async remove(req, res) {
    const result = await homeSideBannerService.remove(req.params.id);
    return res.status(200).json(result);
  }

  async update(req, res) {
    const { entry, clearedImages } = await homeSideBannerService.update(req.params.id, req.body);
    imagesArr = clearedImages;
    return res.send(entry);
  }
}

module.exports = new HomeSideBannerController();
