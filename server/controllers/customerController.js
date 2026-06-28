const customerService = require('../services/customerService');

class CustomerController {
  async list(req, res) {
    try {
      const customerList = await customerService.list();
      return res.status(200).json({ customerList });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  async getCount(req, res) {
    try {
      const customerCount = await customerService.getCount();
      return res.send({ customerCount });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    try {
      const customerData = await customerService.getById(req.params.id);
      return res.status(200).json({ customerData });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false });
    }
  }

  async updateStatus(req, res) {
    try {
      const customer = await customerService.updateStatus(req.params.id, req.body.status);
      return res.send(customer);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false });
    }
  }
}

module.exports = new CustomerController();
