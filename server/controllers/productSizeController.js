const productSizeService = require('../services/productSizeService');

class ProductSizeController {
  async list(req, res) {
    try {
      const productSizeList = await productSizeService.list();

      if (!productSizeList) {
        res.status(500).json({ success: false });
      }

      return res.status(200).json(productSizeList);
    } catch {
      res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    const item = await productSizeService.findById(req.params.id);

    if (!item) {
      res.status(500).json({ message: 'The item with the given ID was not found.' });
    }
    return res.status(200).send(item);
  }

  async create(req, res) {
    const productsize = await productSizeService.create(req.body);
    res.status(201).json(productsize);
  }

  async remove(req, res) {
    const deletedItem = await productSizeService.deleteById(req.params.id);

    if (!deletedItem) {
      res.status(404).json({
        message: 'Item not found!',
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item Deleted!',
    });
  }

  async update(req, res) {
    const item = await productSizeService.update(req.params.id, req.body);

    if (!item) {
      return res.status(500).json({
        message: 'item cannot be updated!',
        success: false,
      });
    }

    res.send(item);
  }
}

module.exports = new ProductSizeController();
