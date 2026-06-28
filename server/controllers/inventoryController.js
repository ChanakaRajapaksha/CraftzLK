const inventoryService = require('../services/inventoryService');

class InventoryController {
  async getStock(req, res) {
    try {
      const { stockList, stats } = await inventoryService.getStock();
      return res.status(200).json({ success: true, stockList, stats });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load stock list.' });
    }
  }

  async getAdjustments(req, res) {
    try {
      const adjustmentList = await inventoryService.getAdjustments();
      return res.status(200).json({ success: true, adjustmentList });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load adjustments.' });
    }
  }

  async adjust(req, res) {
    try {
      const result = await inventoryService.adjust(req.body);
      return res.status(201).json({ success: true, ...result });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to adjust stock.' });
    }
  }
}

module.exports = new InventoryController();
