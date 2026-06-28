const { Cart } = require('../models/cart');

class CartService {
  async list(query) {
    return Cart.find(query);
  }

  async getById(id) {
    const item = await Cart.findById(id);
    if (!item) {
      const error = new Error('The cart item with the given ID was not found.');
      error.statusCode = 500;
      throw error;
    }
    return item;
  }

  async add(body) {
    const existing = await Cart.find({ productId: body.productId, userId: body.userId });
    if (existing.length > 0) {
      const error = new Error('Product already added in the cart');
      error.statusCode = 401;
      error.payload = { status: false, msg: error.message };
      throw error;
    }

    const cartItem = new Cart({
      productTitle: body.productTitle,
      image: body.image,
      rating: body.rating,
      price: body.price,
      quantity: body.quantity,
      subTotal: body.subTotal,
      productId: body.productId,
      userId: body.userId,
      countInStock: body.countInStock,
    });

    return cartItem.save();
  }

  async update(id, body) {
    const cartItem = await Cart.findByIdAndUpdate(
      id,
      {
        productTitle: body.productTitle,
        image: body.image,
        rating: body.rating,
        price: body.price,
        quantity: body.quantity,
        subTotal: body.subTotal,
        productId: body.productId,
        userId: body.userId,
      },
      { new: true }
    );

    if (!cartItem) {
      const error = new Error('Cart item cannot be updated!');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    return cartItem;
  }

  async remove(id) {
    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      const error = new Error('The cart item given id is not found!');
      error.statusCode = 404;
      error.payload = { msg: error.message };
      throw error;
    }

    const deleted = await Cart.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error('Cart item not found!');
      error.statusCode = 404;
      error.payload = { success: false };
      throw error;
    }

    return { success: true, message: 'Cart Item Deleted!' };
  }
}

module.exports = new CartService();
