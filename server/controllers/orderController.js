const orderService = require('../services/orderService');

class OrderController {
  async getSales(req, res) {
    try {
      const result = await orderService.getSales();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async list(req, res) {
    try {
      const ordersList = await orderService.list(req.user, req.query);
      return res.status(200).json(ordersList);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }

  async getById(req, res) {
    try {
      const order = await orderService.getById(req.params.id, req.user);
      return res.status(200).json(order);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }

  async getCount(req, res) {
    try {
      const orderCount = await orderService.getCount();
      return res.status(200).json({ orderCount });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const order = await orderService.create(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        order,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }

  async remove(req, res) {
    try {
      const deletedOrder = await orderService.remove(req.params.id, req.user);
      if (!deletedOrder) {
        return res.status(404).json({
          message: 'Order not found!',
          success: false,
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Order Deleted!',
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }

  async update(req, res) {
    try {
      const order = await orderService.update(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }
}

module.exports = new OrderController();
