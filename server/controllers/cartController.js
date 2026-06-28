const cartService = require('../services/cartService');

class CartController {
  async list(req, res) {
    try {
      const cartList = await cartService.list(req.query);
      return res.status(200).json(cartList);
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    try {
      const item = await cartService.getById(req.params.id);
      return res.status(200).send(item);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { message: error.message }
      );
    }
  }

  async add(req, res) {
    try {
      const cartItem = await cartService.add(req.body);
      return res.status(201).json(cartItem);
    } catch (error) {
      if (error.statusCode === 401) {
        return res.status(401).json(error.payload);
      }
      return res.status(500).json({ success: false });
    }
  }

  async update(req, res) {
    try {
      const cartItem = await cartService.update(req.params.id, req.body);
      return res.send(cartItem);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { message: error.message, success: false }
      );
    }
  }

  async remove(req, res) {
    try {
      const result = await cartService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || { success: false }
      );
    }
  }
}

module.exports = new CartController();
