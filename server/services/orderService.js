const { Orders } = require('../models/orders');
const { Payment } = require('../models/payment');
const { ShippingMethod } = require('../models/shippingMethod');
const customerService = require('./customerService');
const couponsService = require('./couponsService');
const paymentService = require('./paymentService');
const stockService = require('./stockService');
const adminNotificationsService = require('./adminNotificationsService');
const orderEmailService = require('./orderEmailService');
const { isCostAvailable } = require('../utils/reportProfit');

const ORDER_TO_PAYMENT_STATUS = {
  paid: 'success',
  pending: 'pending',
  failed: 'failed',
  refunded: 'refunded',
};

function resolveUserId(authUser, bodyUserId) {
  const id = authUser?._id || authUser?.id || bodyUserId;
  return id ? String(id) : '';
}

function resolvePaymentStatus() {
  return 'pending';
}

function normalizeProducts(products = []) {
  return products.map((item) => ({
    productId: String(item.productId || ''),
    productTitle: item.productTitle || '',
    variant: String(item.variant || item.variantLabel || ''),
    variantSku: String(item.variantSku || ''),
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
    image: item.image || '',
    subTotal:
      Number(item.subTotal) ||
      (Number(item.price) || 0) * (Number(item.quantity) || 1),
  }));
}

async function generateOrderNumber() {
  const count = await Orders.countDocuments();
  return `#${1000 + count + 1}`;
}

class OrderService {
  async getSales() {
    const ordersList = await Orders.find();

    let totalSales = 0;
    const monthlySales = [
      { month: 'JAN', sale: 0 },
      { month: 'FEB', sale: 0 },
      { month: 'MAR', sale: 0 },
      { month: 'APRIL', sale: 0 },
      { month: 'MAY', sale: 0 },
      { month: 'JUNE', sale: 0 },
      { month: 'JULY', sale: 0 },
      { month: 'AUG', sale: 0 },
      { month: 'SEP', sale: 0 },
      { month: 'OCT', sale: 0 },
      { month: 'NOV', sale: 0 },
      { month: 'DEC', sale: 0 },
    ];

    for (let i = 0; i < ordersList.length; i += 1) {
      totalSales += parseFloat(ordersList[i].amount) || 0;
      const orderDate = new Date(ordersList[i]?.date);
      const month = orderDate.getMonth() + 1;

      if (month >= 1 && month <= 12) {
        monthlySales[month - 1].sale += parseFloat(ordersList[i].amount) || 0;
      }
    }

    return { totalSales, monthlySales };
  }

  async list(authUser, query = {}) {
    const userId = resolveUserId(authUser);
    const isAdmin = authUser?.role === 'admin';
    const filter = {};

    if (isAdmin) {
      if (query.userid) filter.userid = String(query.userid);
    } else {
      if (!userId) {
        const error = new Error('Login again to access this page.');
        error.statusCode = 401;
        error.payload = { success: false, message: error.message };
        throw error;
      }
      filter.userid = userId;
    }

    return Orders.find(filter).sort({ date: -1 });
  }

  async getById(id, authUser) {
    const order = await Orders.findById(id);
    if (!order) {
      const error = new Error('The order with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const userId = resolveUserId(authUser);
    const isAdmin = authUser?.role === 'admin';
    if (!isAdmin && userId && order.userid !== userId) {
      const error = new Error('Login again to access this page.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return order;
  }

  async getCount() {
    return Orders.countDocuments();
  }

  async create(body, authUser) {
    const userid = resolveUserId(authUser, body.userid);
    if (!userid) {
      const error = new Error('Login again to access this page.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const products = normalizeProducts(body.products);
    if (!products.length) {
      const error = new Error('Your cart is empty.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const subtotal =
      Number(body.subtotal) ||
      products.reduce((sum, item) => sum + (Number(item.subTotal) || 0), 0);
    const shipping = Number(body.shipping) || 0;

    let discount = 0;
    let couponCode = '';

    if (body.couponCode) {
      const validation = await couponsService.validateCoupon(body.couponCode, subtotal);
      if (!validation.valid) {
        const error = new Error(validation.message || 'Invalid coupon code.');
        error.statusCode = 400;
        error.payload = { success: false, message: error.message, reason: validation.reason };
        throw error;
      }
      discount = validation.discount;
      couponCode = validation.code;
      await couponsService.incrementUsage(validation.couponId);
    } else if (Number(body.discount) > 0) {
      const error = new Error('Coupon code is required when applying a discount.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const computedAmount = Math.round(Math.max(0, subtotal + shipping - discount) * 100) / 100;

    await stockService.validateOrderStock(products);

    let shippingMethodId = String(body.shippingMethodId || '').trim();
    let actualShippingCost = null;

    if (shippingMethodId) {
      const method = await ShippingMethod.findById(shippingMethodId).lean();
      if (method && isCostAvailable(method.actualShippingCost)) {
        actualShippingCost = Number(method.actualShippingCost);
      }
    } else if (isCostAvailable(body.actualShippingCost)) {
      actualShippingCost = Number(body.actualShippingCost);
    } else {
      const method = await ShippingMethod.findOne({ cost: shipping, status: 'active' }).lean();
      if (method) {
        shippingMethodId = String(method._id);
        if (isCostAvailable(method.actualShippingCost)) {
          actualShippingCost = Number(method.actualShippingCost);
        }
      }
    }

    const paymentMethod = body.paymentMethod || 'cod';
    const paymentStatus = resolvePaymentStatus(paymentMethod);
    const status = 'placed';
    const orderNumber = await generateOrderNumber();
    const paymentId = body.paymentId || `ORD_${Date.now()}_${userid.slice(-6)}`;
    const now = new Date();

    const order = new Orders({
      name: body.name,
      phoneNumber: body.phoneNumber,
      address: body.address,
      shippingAddress: body.shippingAddress || '',
      pincode: body.pincode,
      amount: String(computedAmount),
      paymentId,
      email: body.email,
      userid,
      products,
      orderNumber,
      orderNotes: body.orderNotes || '',
      paymentMethod,
      paymentStatus,
      status,
      statusHistory: [{ status, date: now }],
      subtotal,
      discount,
      couponCode,
      tax: Number(body.tax) || 0,
      shipping,
      shippingMethodId,
      actualShippingCost,
      date: body.date ? new Date(body.date) : now,
    });

    const savedOrder = await order.save();

    try {
      await stockService.deductForOrder(savedOrder);
      savedOrder.stockDeducted = true;
      await savedOrder.save();
    } catch (error) {
      await Orders.findByIdAndDelete(savedOrder._id);
      throw error;
    }

    await customerService.upsertFromOrder(savedOrder);
    await paymentService.createForOrder({
      orderId: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
      paymentId: savedOrder.paymentId,
      amount: computedAmount,
      userId: userid,
      paymentMethod,
    });

    try {
      await adminNotificationsService.notifyNewOrder(savedOrder.toObject?.() || savedOrder);
    } catch (error) {
      console.error('[orderService.create] Failed to notify admin of new order:', error.message);
    }

    orderEmailService.queueOrderStatusEmail(savedOrder.toObject?.() || savedOrder, 'placed');

    return savedOrder;
  }

  async remove(id, authUser) {
    await this.getById(id, authUser);
    return Orders.findByIdAndDelete(id);
  }

  async update(id, body, authUser) {
    const order = await this.getById(id, authUser);
    const previousStatus = order.status;

    const nextStatus = body.status ?? body.orderStatus ?? order.status;
    if (nextStatus && nextStatus !== order.status) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status: nextStatus, date: new Date() });
      order.status = nextStatus;
    }

    if (
      nextStatus === 'cancelled' &&
      previousStatus !== 'cancelled' &&
      order.stockDeducted &&
      !order.stockRestored
    ) {
      await stockService.restoreForOrder(order);
      order.stockRestored = true;
    }

    if (body.paymentStatus !== undefined) {
      order.paymentStatus = body.paymentStatus;
      await Payment.findOneAndUpdate(
        { orderId: String(order._id) },
        { status: ORDER_TO_PAYMENT_STATUS[body.paymentStatus] || 'pending' }
      );
    }
    if (body.name !== undefined) order.name = body.name;
    if (body.phoneNumber !== undefined) order.phoneNumber = body.phoneNumber;
    if (body.address !== undefined) order.address = body.address;
    if (body.shippingAddress !== undefined) order.shippingAddress = body.shippingAddress;
    if (body.pincode !== undefined) order.pincode = body.pincode;
    if (body.amount !== undefined) order.amount = body.amount;
    if (body.paymentId !== undefined) order.paymentId = body.paymentId;
    if (body.email !== undefined) order.email = body.email;
    if (body.products !== undefined) order.products = normalizeProducts(body.products);
    if (body.orderNotes !== undefined) order.orderNotes = body.orderNotes;
    if (body.subtotal !== undefined) order.subtotal = Number(body.subtotal) || 0;
    if (body.discount !== undefined) order.discount = Number(body.discount) || 0;
    if (body.tax !== undefined) order.tax = Number(body.tax) || 0;
    if (body.shipping !== undefined) order.shipping = Number(body.shipping) || 0;
    if (body.trackingNumber !== undefined) order.trackingNumber = String(body.trackingNumber || '');
    if (body.courierName !== undefined) order.courierName = String(body.courierName || '');
    if (body.trackingUrl !== undefined) order.trackingUrl = String(body.trackingUrl || '');
    if (body.estimatedDeliveryDate !== undefined) {
      order.estimatedDeliveryDate = body.estimatedDeliveryDate
        ? new Date(body.estimatedDeliveryDate)
        : null;
    }

    await order.save();

    if (nextStatus !== previousStatus) {
      const statusEmailMap = {
        confirmed: 'confirmed',
        shipped: 'shipped',
        delivered: 'delivered',
      };
      const emailKey = statusEmailMap[nextStatus];
      if (emailKey) {
        orderEmailService.queueOrderStatusEmail(order.toObject?.() || order, emailKey);
      }
    }

    return order;
  }
}

module.exports = new OrderService();
