const productRAMSService = require('../services/productRAMSService');

class ProductRAMSController {
  async list(req, res) {
    try {
      const productREAMSList = await productRAMSService.list();

      if (!productREAMSList) {
        res.status(500).json({ success: false });
      }

      return res.status(200).json(productREAMSList);
    } catch {
      res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    const item = await productRAMSService.findById(req.params.id);

    if (!item) {
      res.status(500).json({ message: 'The item with the given ID was not found.' });
    }
    return res.status(200).send(item);
  }

  async create(req, res) {
    const productRAMS = await productRAMSService.create(req.body);
    res.status(201).json(productRAMS);
  }

  async remove(req, res) {
    const deletedItem = await productRAMSService.deleteById(req.params.id);

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
    const item = await productRAMSService.update(req.params.id, req.body);

    if (!item) {
      return res.status(500).json({
        message: 'item cannot be updated!',
        success: false,
      });
    }

    res.send(item);
  }
}

module.exports = new ProductRAMSController();
