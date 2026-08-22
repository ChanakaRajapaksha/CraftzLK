const dashboardService = require('../services/dashboardService');

class DashboardController {
  async overview(req, res) {
    try {
      const result = await dashboardService.getOverview(req.query, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message || 'Failed to load dashboard.' }
      );
    }
  }
}

module.exports = new DashboardController();
