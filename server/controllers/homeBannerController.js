const homeBannerService = require('../services/homeBannerService');

let imagesArr = [];

class HomeBannerController {
  async upload(req, res) {
    imagesArr = [];

    try {
      imagesArr = await homeBannerService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  }

  async list(_req, res) {
    try {
      const bannerImagesList = await homeBannerService.list();
      return res.status(200).json(bannerImagesList);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async getById(req, res) {
    try {
      const slide = await homeBannerService.getById(req.params.id);
      return res.status(200).send(slide);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async create(_req, res) {
    const { entry, clearedImages } = await homeBannerService.create(imagesArr);
    imagesArr = clearedImages;
    return res.status(201).json(entry);
  }

  async deleteImage(req, res) {
    const response = await homeBannerService.deleteImage(req.query.img);

    if (response) {
      return res.status(200).send(response);
    }
  }

  async remove(req, res) {
    const result = await homeBannerService.remove(req.params.id);
    return res.status(200).json(result);
  }

  async update(req, res) {
    const { entry, clearedImages } = await homeBannerService.update(req.params.id, req.body);
    imagesArr = clearedImages;
    return res.send(entry);
  }
}

module.exports = new HomeBannerController();
