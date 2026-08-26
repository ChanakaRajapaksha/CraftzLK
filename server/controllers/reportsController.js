const reportsService = require('../services/reportsService');
const reportExportService = require('../services/reportExportService');

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

  async export(req, res) {
    try {
      const type = String(req.params.type || '').toLowerCase();
      const format = String(req.query.format || 'pdf').toLowerCase();
      const result = await reportExportService.export(type, format, req.query, req.user);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.filename}"`
      );
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(result.buffer);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to export report.' }
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

  async payments(req, res) {
    try {
      const result = await reportsService.getPaymentReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load payment report.' }
      );
    }
  }

  async inventory(req, res) {
    try {
      const result = await reportsService.getInventoryReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load inventory report.' }
      );
    }
  }

  async coupons(req, res) {
    try {
      const result = await reportsService.getCouponReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load coupon report.' }
      );
    }
  }

  async orders(req, res) {
    try {
      const result = await reportsService.getOrderReport(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load order report.' }
      );
    }
  }
}

module.exports = new ReportsController();
