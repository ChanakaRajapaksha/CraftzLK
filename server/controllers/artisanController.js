const artisanService = require('../services/artisanService');
const { isCloudinaryConfigured } = require('../utils/cloudinary');

class ArtisanController {
  async upload(req, res, uploadError) {
    if (uploadError) {
      if (uploadError.message === 'Only image uploads are allowed.') {
        return res.status(400).json({ success: false, message: uploadError.message });
      }
      if (uploadError.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image must be 5 MB or smaller.' });
      }
      console.error(uploadError);
      return res.status(500).json({ success: false, message: 'Upload failed.' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary is not configured on the server.',
      });
    }

    try {
      const imagesArr = await artisanService.uploadImages(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      artisanService.cleanupUploadFiles(req.files);
      console.error(error);
      return res.status(500).json({ success: false, message: 'Upload failed.' });
    }
  }

  async adminList(req, res) {
    try {
      const data = await artisanService.adminList(req.query);
      return res.status(200).json({ success: true, ...data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to load artisans.' });
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
    try {
      const result = await artisanService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(error.payload);
      }
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to create artisan.' });
    }
  }

  async deleteImage(req, res) {
    try {
      const response = await artisanService.deleteImage(req.query.img);
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to delete image.' }
      );
    }
  }

  async remove(req, res) {
    try {
      const result = await artisanService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to delete artisan.' }
      );
    }
  }

  async update(req, res) {
    try {
      const result = await artisanService.update(req.params.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(error.payload);
      }
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to update artisan.' });
    }
  }
}

module.exports = new ArtisanController();
