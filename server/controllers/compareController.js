const compareService = require('../services/compareService');

class CompareController {
  async compareProducts(req, res) {
    try {
      const result = await compareService.compareProducts(req.body);
      return res.json(result);
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404 || error.statusCode === 500) {
        return res.status(error.statusCode).json(error.payload);
      }
      console.error('Compare Products Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new CompareController();
