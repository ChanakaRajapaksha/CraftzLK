const artisanService = require('../services/artisanService');

let imagesArr = [];

class ArtisanController {
  async upload(req, res) {
    imagesArr = [];

    try {
      imagesArr = await artisanService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false });
    }
  }

  async list(_req, res) {
    try {
      const result = await artisanService.list();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async getCount(_req, res) {
    try {
      const result = await artisanService.getCount();
      return res.send(result);
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    try {
      const result = await artisanService.getById(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async create(req, res) {
    const { artisan, clearedImages } = await artisanService.create(req.body, imagesArr);
    imagesArr = clearedImages;
    return res.status(201).json(artisan);
  }

  async deleteImage(req, res) {
    const response = await artisanService.deleteImage(req.query.img);

    if (response) {
      return res.status(200).send(response);
    }

    return res.status(500).json({ success: false });
  }

  async remove(req, res) {
    const result = await artisanService.remove(req.params.id);
    return res.status(200).json(result);
  }

  async update(req, res) {
    const { artisan, clearedImages } = await artisanService.update(req.params.id, req.body);
    imagesArr = clearedImages;
    return res.send(artisan);
  }
}

module.exports = new ArtisanController();
