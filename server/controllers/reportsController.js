const reportsService = require('../services/reportsService');

class ReportsController {
  async sales(req, res) {
    try {
      const result = await reportsService.getSalesReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load sales report.' }
      );
    }
  }

  async products(req, res) {
    try {
      const result = await reportsService.getProductReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load product report.' }
      );
    }
  }

  async customers(req, res) {
    try {
      const result = await reportsService.getCustomerReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load customer report.' }
      );
    }
  }
}

module.exports = new ReportsController();
