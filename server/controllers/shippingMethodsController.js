const shippingMethodsService = require('../services/shippingMethodsService');

class ShippingMethodsController {
  async list(req, res) {
    try {
      const list = await shippingMethodsService.list();
      return res.status(200).json({
        success: true,
        methodList: list.map((doc) => shippingMethodsService.mapMethod(doc)),
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load shipping methods.' });
    }
  }

  async getById(req, res) {
    try {
      const item = await shippingMethodsService.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Shipping method not found.' });
      }
      return res.status(200).json(shippingMethodsService.mapMethod(item));
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load shipping method.' });
    }
  }

  async create(req, res) {
    try {
      const saved = await shippingMethodsService.create(req.body);
      return res.status(201).json(shippingMethodsService.mapMethod(saved));
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to create shipping method.' });
    }
  }

  async update(req, res) {
    try {
      const updated = await shippingMethodsService.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Shipping method not found.' });
      }

      return res.status(200).json(shippingMethodsService.mapMethod(updated));
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to update shipping method.' });
    }
  }

  async remove(req, res) {
    try {
      const deleted = await shippingMethodsService.deleteById(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Shipping method not found.' });
      }
      return res.status(200).json({ success: true, message: 'Shipping method deleted.' });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to delete shipping method.' });
    }
  }
}

module.exports = new ShippingMethodsController();
