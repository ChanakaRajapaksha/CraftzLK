const { Cart } = require('../models/cart');

function resolveUserId(authUser, bodyUserId) {
  const id = authUser?._id || authUser?.id || bodyUserId;
  return id ? String(id) : '';
}

function buildVariantQuery(userId, body) {
  return {
    userId,
    productId: String(body.productId),
    variantSku: String(body.variantSku || ''),
    variantLabel: String(body.variantLabel || ''),
  };
}

class CartService {
  async list(authUser, query = {}) {
    const userId = resolveUserId(authUser, query.userId);
    if (!userId) {
      const error = new Error('Login again to access this page.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return Cart.find({ userId }).sort({ _id: -1 });
  }

  async getById(id, authUser) {
    const item = await Cart.findById(id);
    if (!item) {
      const error = new Error('The cart item with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const userId = resolveUserId(authUser);
    if (userId && item.userId !== userId) {
      const error = new Error('Login again to access this page.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return item;
  }

  async add(body, authUser) {
    const userId = resolveUserId(authUser, body.userId);
    if (!userId) {
      const error = new Error('Login again to access this page.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const quantity = Math.max(1, Number(body.quantity) || 1);
    const price = Number(body.price) || 0;
    const countInStock = Math.max(0, Number(body.countInStock) || 0);
    const variantQuery = buildVariantQuery(userId, body);
    const existing = await Cart.findOne(variantQuery);

    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (countInStock > 0 && nextQty > countInStock) {
        const error = new Error('The quantity is greater than product count in stock');
        error.statusCode = 400;
        error.payload = { success: false, status: false, msg: error.message };
        throw error;
      }

      existing.quantity = nextQty;
      existing.subTotal = price * nextQty;
      existing.price = price;
      existing.countInStock = countInStock;
      existing.productTitle = body.productTitle;
      existing.image = body.image;
      existing.rating = Number(body.rating) || existing.rating;
      await existing.save();
      return existing;
    }

    if (countInStock > 0 && quantity > countInStock) {
      const error = new Error('The quantity is greater than product count in stock');
      error.statusCode = 400;
      error.payload = { success: false, status: false, msg: error.message };
      throw error;
    }

    const cartItem = new Cart({
      productTitle: body.productTitle,
      image: body.image,
      rating: Number(body.rating) || 0,
      price,
      quantity,
      subTotal: price * quantity,
      productId: String(body.productId),
      variantLabel: String(body.variantLabel || ''),
      variantSku: String(body.variantSku || ''),
      countInStock,
      userId,
    });

    return cartItem.save();
  }

  async update(id, body, authUser) {
    const existing = await this.getById(id, authUser);
    const quantity = Math.max(1, Number(body.quantity) || existing.quantity);
    const price = Number(body.price) || existing.price;
    const countInStock = Math.max(0, Number(body.countInStock ?? existing.countInStock) || 0);

    if (countInStock > 0 && quantity > countInStock) {
      const error = new Error('The quantity is greater than product count in stock');
      error.statusCode = 400;
      error.payload = { success: false, status: false, msg: error.message };
      throw error;
    }

    existing.productTitle = body.productTitle ?? existing.productTitle;
    existing.image = body.image ?? existing.image;
    existing.rating = Number(body.rating ?? existing.rating);
    existing.price = price;
    existing.quantity = quantity;
    existing.subTotal = price * quantity;
    existing.productId = String(body.productId ?? existing.productId);
    existing.variantLabel = String(body.variantLabel ?? existing.variantLabel ?? '');
    existing.variantSku = String(body.variantSku ?? existing.variantSku ?? '');
    existing.countInStock = countInStock;

    return existing.save();
  }

  async remove(id, authUser) {
    await this.getById(id, authUser);
    const deleted = await Cart.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error('Cart item not found!');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return { success: true, message: 'Cart Item Deleted!' };
  }
}

module.exports = new CartService();
