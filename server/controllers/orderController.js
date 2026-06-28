const orderService = require('../services/orderService');

class OrderController {
  async getSales(req, res) {
    try {
      const result = await orderService.getSales();
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
    }
  }

  async list(req, res) {
    try {
      const ordersList = await orderService.list(req.query);

      if (!ordersList) {
        res.status(500).json({ success: false });
      }

      return res.status(200).json(ordersList);
    } catch (error) {
      res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    const order = await orderService.getById(req.params.id);

    if (!order) {
      res.status(500).json({ message: 'The order with the given ID was not found.' });
    }
    return res.status(200).send(order);
  }

  async getCount(req, res) {
    const orderCount = await orderService.getCount();

    if (!orderCount) {
      res.status(500).json({ success: false });
    } else {
      res.send({
        orderCount: orderCount,
      });
    }
  }

  async create(req, res) {
    const order = await orderService.create(req.body);

    if (!order) {
      res.status(500).json({
        error: err,
        success: false,
      });
    }

    res.status(201).json(order);
  }

  async remove(req, res) {
    const deletedOrder = await orderService.remove(req.params.id);

    if (!deletedOrder) {
      res.status(404).json({
        message: 'Order not found!',
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order Deleted!',
    });
  }

  async update(req, res) {
    try {
      const order = await orderService.update(req.params.id, req.body);
      return res.send(order);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({
        message: 'Order cannot be updated!',
        success: false,
      });
    }
  }
}

module.exports = new OrderController();
