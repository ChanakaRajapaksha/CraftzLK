const paymentMethodService = require('../services/paymentMethodService');

class PaymentMethodController {
  async getPublicBankTransferDetails(req, res) {
    try {
      const details = await paymentMethodService.getPublicBankTransferDetails();
      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Bank transfer payment method is not available.',
        });
      }
      return res.status(200).json({ success: true, ...details });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load bank details.' });
    }
  }

  async getMethods(req, res) {
    try {
      const methodList = await paymentMethodService.getMethods();
      return res.status(200).json({
        success: true,
        methodList,
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load payment methods.' });
    }
  }

  async getMethodById(req, res) {
    try {
      const method = await paymentMethodService.getMethodById(req.params.id);
      return res.status(200).json(method);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to load payment method.' });
    }
  }

  async updateMethod(req, res) {
    try {
      const method = await paymentMethodService.updateMethod(req.params.id, req.body);
      return res.status(200).json(method);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to update payment method.' });
    }
  }

  async getTransactions(req, res) {
    try {
      const transactionList = await paymentMethodService.getTransactions();
      return res.status(200).json({
        success: true,
        transactionList,
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load transactions.' });
    }
  }
}

module.exports = new PaymentMethodController();
