const cartService = require('../services/cartService');

class CartController {
  async list(req, res) {
    try {
      const cartList = await cartService.list(req.user, req.query);
      return res.status(200).json(cartList);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }

  async getById(req, res) {
    try {
      const item = await cartService.getById(req.params.id, req.user);
      return res.status(200).json(item);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }

  async add(req, res) {
    try {
      const cartItem = await cartService.add(req.body, req.user);
      return res.status(201).json({
        success: true,
        status: true,
        message: 'Item added to cart.',
        data: cartItem,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, status: false, message: error.message }
      );
    }
  }

  async update(req, res) {
    try {
      const cartItem = await cartService.update(req.params.id, req.body, req.user);
      return res.status(200).json({
        success: true,
        status: true,
        data: cartItem,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, status: false, message: error.message }
      );
    }
  }

  async remove(req, res) {
    try {
      const result = await cartService.remove(req.params.id, req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false, message: error.message }
      );
    }
  }
}

module.exports = new CartController();
