const paymentService = require('../services/paymentService');

class PaymentController {
  async getHash(req, res) {
    try {
      const result = paymentService.getHash(req.body);
      return res.status(200).json({
        success: true,
        hash: result.hash,
      });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 500) {
        return res.status(error.statusCode).json(error.payload);
      }
      console.error('Error generating hash:', error);
      return res.status(500).json({
        success: false,
        error: 'Error generating payment hash',
      });
    }
  }

  async notify(req, res) {
    try {
      await paymentService.processNotify(req.body);
      return res.status(200).json({ success: true });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      console.error('Error processing payment notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing payment notification',
      });
    }
  }
}

module.exports = new PaymentController();
