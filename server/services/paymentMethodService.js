const { PaymentMethod } = require('../models/paymentMethod');
const { Payment } = require('../models/payment');

const DEFAULT_METHODS = [
  {
    code: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay with cash when your order is delivered.',
    status: 'active',
  },
  {
    code: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Transfer payment to our bank account and send the slip with your order number.',
    bankName: '',
    branchName: '',
    accountName: '',
    accountNumber: '',
    status: 'active',
  },
];

const mapMethod = (doc) => ({
  _id: doc._id,
  id: doc._id,
  code: doc.code,
  name: doc.name,
  description: doc.description || '',
  bankName: doc.bankName || '',
  branchName: doc.branchName || '',
  accountName: doc.accountName || '',
  accountNumber: doc.accountNumber || '',
  status: doc.status || 'active',
  dateCreated: doc.createdAt,
});

const normalizeTransactionStatus = (status) => {
  const map = {
    paid: 'success',
    success: 'success',
    pending: 'pending',
    failed: 'failed',
    refunded: 'refunded',
    cancelled: 'cancelled',
    chargedback: 'chargedback',
  };
  return map[status] || status || 'pending';
};

const mapTransaction = (entry) => ({
  _id: entry._id,
  id: entry._id,
  transactionId: entry.transactionId,
  orderId: entry.orderId,
  orderLabel: entry.orderLabel || entry.orderId,
  amount: entry.amount,
  currency: entry.currency || 'LKR',
  status: normalizeTransactionStatus(entry.status),
  paymentMethod: entry.paymentMethod || '',
  date: entry.date,
});

class PaymentMethodService {
  async ensureDefaultMethods() {
    const count = await PaymentMethod.countDocuments();
    if (count > 0) return;
    await PaymentMethod.insertMany(DEFAULT_METHODS);
  }

  async getMethods() {
    await this.ensureDefaultMethods();
    const list = await PaymentMethod.find().sort({ code: 1 });
    return list.map(mapMethod);
  }

  async getMethodById(id) {
    const item = await PaymentMethod.findById(id);
    if (!item) {
      const error = new Error('Payment method not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return mapMethod(item);
  }

  async updateMethod(id, body) {
    const updated = await PaymentMethod.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description || '',
        bankName: body.bankName || '',
        branchName: body.branchName || '',
        accountName: body.accountName || '',
        accountNumber: body.accountNumber || '',
        status: body.status || 'active',
      },
      { new: true }
    );

    if (!updated) {
      const error = new Error('Payment method not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return mapMethod(updated);
  }

  async getPublicBankTransferDetails() {
    await this.ensureDefaultMethods();
    const item = await PaymentMethod.findOne({ code: 'bank_transfer', status: 'active' });

    if (!item) {
      return null;
    }

    return {
      code: item.code,
      name: item.name,
      description: item.description || '',
      bankDetails: {
        bankName: item.bankName || '',
        branchName: item.branchName || '',
        accountNumber: item.accountNumber || '',
        accountHolderName: item.accountName || '',
      },
    };
  }

  async getTransactions() {
    const payments = await Payment.find().sort({ createdAt: -1 });

    return payments.map((item) =>
      mapTransaction({
        _id: item._id,
        transactionId: item.paymentId,
        orderId: item.orderId,
        orderLabel: item.orderNumber || item.orderId,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        paymentMethod: item.paymentMethod,
        date: item.createdAt,
      })
    );
  }
}

module.exports = new PaymentMethodService();
