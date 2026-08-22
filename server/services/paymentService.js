const crypto = require('crypto');
const { Payment } = require('../models/payment');
const { Orders } = require('../models/orders');

const ORDER_PAYMENT_STATUS_MAP = {
  success: 'paid',
  pending: 'pending',
  failed: 'failed',
  cancelled: 'failed',
  chargedback: 'failed',
  refunded: 'refunded',
};

function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = Number(amount).toFixed(2);

  const md5MerchantSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${md5MerchantSecret}`;
  return crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase();
}

function verifyPayHereHash(params, merchantSecret) {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
  } = params;

  const md5MerchantSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const localHash = crypto
    .createHash('md5')
    .update(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        md5MerchantSecret
    )
    .digest('hex')
    .toUpperCase();

  return localHash === params.md5sig;
}

class PaymentService {
  getHash(body) {
    const { merchantId, orderId, amount, currency = 'LKR' } = body;

    if (!merchantId || !orderId || !amount) {
      const missingFields = [];
      if (!merchantId) missingFields.push('merchantId');
      if (!orderId) missingFields.push('orderId');
      if (!amount) missingFields.push('amount');

      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      error.statusCode = 400;
      error.payload = { success: false, error: error.message };
      throw error;
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      const error = new Error('Missing merchant secret configuration');
      error.statusCode = 500;
      error.payload = { success: false, error: error.message };
      throw error;
    }

    const hash = generatePayHereHash(
      merchantId,
      orderId,
      amount,
      currency,
      merchantSecret
    );

    return { hash };
  }

  async createForOrder({
    orderId,
    orderNumber,
    paymentId,
    amount,
    userId,
    paymentMethod,
    currency = 'LKR',
  }) {
    const orderKey = String(orderId);
    const existing = await Payment.findOne({ orderId: orderKey });
    if (existing) return existing;

    return Payment.create({
      orderId: orderKey,
      orderNumber: orderNumber || '',
      paymentId,
      amount: Number(amount) || 0,
      currency,
      status: 'pending',
      userId: String(userId),
      paymentMethod: paymentMethod || '',
    });
  }

  async syncOrderPaymentStatus(orderId, paymentStatus) {
    if (!orderId || !paymentStatus) return null;
    return Orders.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );
  }

  async processNotify(body) {
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!verifyPayHereHash(body, merchantSecret)) {
      const error = new Error('Invalid hash');
      error.statusCode = 400;
      error.payload = { success: false, error: error.message };
      throw error;
    }

    const statusMap = {
      2: 'success',
      0: 'pending',
      '-1': 'cancelled',
      '-2': 'failed',
      '-3': 'chargedback',
    };

    const payment = await Payment.findOneAndUpdate(
      { orderId: body.order_id },
      {
        paymentId: body.payment_id,
        amount: parseFloat(body.payhere_amount),
        currency: body.payhere_currency,
        status: statusMap[body.status_code] || 'pending',
        userId: body.custom_1,
        paymentMethod: body.method,
        cardHolderName: body.card_holder_name,
        cardNo: body.card_no,
      },
      { new: true, upsert: true }
    );

    const orderPaymentStatus = ORDER_PAYMENT_STATUS_MAP[payment.status] || 'pending';
    await this.syncOrderPaymentStatus(body.order_id, orderPaymentStatus);

    return payment;
  }
}

module.exports = new PaymentService();
