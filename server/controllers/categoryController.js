const categoryService = require('../services/categoryService');
const { isCloudinaryConfigured } = require('../utils/cloudinary');

class CategoryController {
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
      const imagesArr = await categoryService.uploadImages(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      categoryService.cleanupUploadFiles(req.files);
      console.error(error);
      return res.status(500).json({ success: false, message: 'Upload failed.' });
    }
  }

  async adminList(req, res) {
    try {
      const data = await categoryService.adminList(req.query);
      return res.status(200).json({ success: true, ...data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to load categories.' });
    }
  }

  async list(_req, res) {
    try {
      const result = await categoryService.list();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async listActive(_req, res) {
    try {
      const result = await categoryService.listActive();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: 'Failed to load active categories.',
      });
    }
  }

  async getCount(_req, res) {
    try {
      const result = await categoryService.getCount();
      return res.send(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async getSubCatCount(_req, res) {
    try {
      const result = await categoryService.getSubCatCount();
      return res.send(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async getById(req, res) {
    try {
      const result = await categoryService.getById(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json(error.payload || { success: false });
    }
  }

  async create(req, res) {
    try {
      const result = await categoryService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(error.payload);
      }
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
  }

  async deleteImage(req, res) {
    try {
      const response = await categoryService.deleteImage(req.query.img);
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
      const result = await categoryService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: 'Failed to delete category.' }
      );
    }
  }

  async update(req, res) {
    try {
      const result = await categoryService.update(req.params.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(error.payload);
      }
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
  }
}

module.exports = new CategoryController();
