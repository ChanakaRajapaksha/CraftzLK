const productService = require('../services/productService');

let imagesArr = [];
let productEditId;

class ProductController {
  async upload(req, res) {
    imagesArr = [];

    try {
      imagesArr = await productService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  }

  async adminList(req, res) {
    try {
      const data = await productService.adminList(req.query);
      return res.status(200).json({ success: true, ...data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load products.',
      });
    }
  }

  async listActive(_req, res) {
    try {
      const result = await productService.listActive();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load active products.',
      });
    }
  }

  async list(req, res) {
    try {
      const result = await productService.list(req.query);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }

  async listByCatName(req, res) {
    try {
      const result = await productService.listByCatName(req.query);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }

  async listByCatId(req, res) {
    try {
      const result = await productService.listByCatId(req.query);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }

  async listBySubCatId(req, res) {
    try {
      const result = await productService.listBySubCatId(req.query);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }

  async filterByPrice(req, res) {
    const result = await productService.filterByPrice(req.query);
    return res.status(200).json(result);
  }

  async filterByRating(req, res) {
    const result = await productService.filterByRating(req.query);
    return res.status(200).json(result);
  }

  async getCount(req, res) {
    const { productsCount, isEmpty } = await productService.getCount();

    if (isEmpty) {
      res.status(500).json({ success: false });
    } else {
      res.send({
        productsCount: productsCount,
      });
    }
  }

  async getFeatured(req, res) {
    const { productList, isFalsy } = await productService.getFeatured(req.query);

    if (isFalsy) {
      res.status(500).json({ success: false });
    }

    return res.status(200).json(productList);
  }

  async getRecentlyViewed(req, res) {
    const { productList, isFalsy } = await productService.getRecentlyViewed(req.query);

    if (isFalsy) {
      res.status(500).json({ success: false });
    }

    return res.status(200).json(productList);
  }

  async addRecentlyViewed(req, res) {
    const result = await productService.addRecentlyViewed(req.body);

    if (result) {
      const { product, isFalsy } = result;

      if (isFalsy) {
        res.status(500).json({
          error: err,
          success: false,
        });
      }

      res.status(201).json(product);
    }
  }

  async create(req, res) {
    try {
      const { product, isFalsy } = await productService.create(req.body);

      if (isFalsy) {
        res.status(500).json({
          error: err,
          success: false,
        });
      }

      imagesArr = [];

      res.status(201).json(product);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      if (error.statusCode === 404) {
        if (error.isPlainText) {
          return res.status(404).send(error.payload);
        }
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }

  async bulkDelete(req, res) {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];

    try {
      const result = await productService.bulkDelete(ids);
      res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      throw error;
    }
  }

  async bulkStatus(req, res) {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const status = req.body.status;

    try {
      const result = await productService.bulkStatus(ids, status);
      res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      throw error;
    }
  }

  async getById(req, res) {
    productEditId = req.params.id;

    const { product, isFalsy } = await productService.getById(req.params.id);

    if (isFalsy) {
      res
        .status(500)
        .json({ message: 'The product with the given ID was not found.' });
    }
    return res.status(200).send(product);
  }

  async deleteImage(req, res) {
    const response = await productService.deleteImage(req.query.img);

    if (response) {
      res.status(200).send(response);
    }
  }

  async remove(req, res) {
    const { deletedProduct, isFalsy } = await productService.remove(req.params.id);

    if (isFalsy) {
      res.status(404).json({
        message: 'Product not found!',
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product Deleted!',
    });
  }

  async update(req, res) {
    try {
      const { product, isFalsy } = await productService.update(req.params.id, req.body);

      if (isFalsy) {
        return res.status(404).json({
          message: 'the product can not be updated!',
          status: false,
        });
      }

      imagesArr = [];

      return res.status(200).json({
        message: 'the product is updated!',
        status: true,
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      if (error.statusCode === 404) {
        if (error.isPlainText) {
          return res.status(404).send(error.payload);
        }
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }

  async removeVariantOption(req, res) {
    try {
      const result = await productService.removeVariantOption(
        req.params.id,
        req.params.optionId
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      throw error;
    }
  }
}

module.exports = new ProductController();
