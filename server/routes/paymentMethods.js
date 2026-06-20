const express = require("express");
const router = express.Router();
const { PaymentMethod } = require("../models/paymentMethod");
const { Payment } = require("../models/payment");
const { Orders } = require("../models/orders");

const DEFAULT_METHODS = [
  {
    code: "cod",
    name: "Cash on Delivery",
    description: "Pay with cash when your order is delivered.",
    status: "active",
  },
  {
    code: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer payment to our bank account and send the slip with your order number.",
    bankName: "",
    accountName: "",
    accountNumber: "",
    status: "active",
  },
];

const mapMethod = (doc) => ({
  _id: doc._id,
  id: doc._id,
  code: doc.code,
  name: doc.name,
  description: doc.description || "",
  bankName: doc.bankName || "",
  accountName: doc.accountName || "",
  accountNumber: doc.accountNumber || "",
  status: doc.status || "active",
  dateCreated: doc.createdAt,
});

const normalizeTransactionStatus = (status) => {
  const map = {
    paid: "success",
    success: "success",
    pending: "pending",
    failed: "failed",
    refunded: "refunded",
    cancelled: "cancelled",
    chargedback: "chargedback",
  };
  return map[status] || status || "pending";
};

const mapTransaction = (entry) => ({
  _id: entry._id,
  id: entry._id,
  transactionId: entry.transactionId,
  orderId: entry.orderId,
  orderLabel: entry.orderLabel || entry.orderId,
  amount: entry.amount,
  currency: entry.currency || "LKR",
  status: normalizeTransactionStatus(entry.status),
  paymentMethod: entry.paymentMethod || "",
  date: entry.date,
});

async function ensureDefaultMethods() {
  const count = await PaymentMethod.countDocuments();
  if (count > 0) return;
  await PaymentMethod.insertMany(DEFAULT_METHODS);
}

router.get("/methods", async (_req, res) => {
  try {
    await ensureDefaultMethods();
    const list = await PaymentMethod.find().sort({ code: 1 });
    return res.status(200).json({
      success: true,
      methodList: list.map(mapMethod),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load payment methods." });
  }
});

router.get("/methods/:id", async (req, res) => {
  try {
    const item = await PaymentMethod.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Payment method not found." });
    }
    return res.status(200).json(mapMethod(item));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load payment method." });
  }
});

router.put("/methods/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        description: body.description || "",
        bankName: body.bankName || "",
        accountName: body.accountName || "",
        accountNumber: body.accountNumber || "",
        status: body.status || "active",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Payment method not found." });
    }

    return res.status(200).json(mapMethod(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update payment method." });
  }
});

router.get("/transactions", async (_req, res) => {
  try {
    const [payments, orders] = await Promise.all([
      Payment.find().sort({ createdAt: -1 }),
      Orders.find().sort({ date: -1 }),
    ]);

    const paymentOrderIds = new Set(payments.map((item) => String(item.orderId)));
    const entries = [];

    payments.forEach((item) => {
      entries.push({
        _id: item._id,
        transactionId: item.paymentId,
        orderId: item.orderId,
        orderLabel: item.orderId,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        paymentMethod: item.paymentMethod,
        date: item.createdAt,
      });
    });

    orders.forEach((order) => {
      const orderKey = order.orderNumber || order.paymentId || String(order._id);
      if (paymentOrderIds.has(String(orderKey))) return;

      entries.push({
        _id: order._id,
        transactionId: order.paymentId || orderKey,
        orderId: orderKey,
        orderLabel: order.orderNumber || orderKey,
        amount: Number(order.total ?? order.amount ?? 0),
        currency: "LKR",
        status: order.paymentStatus || "pending",
        paymentMethod: order.paymentMethod,
        date: order.date,
      });
    });

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      success: true,
      transactionList: entries.map(mapTransaction),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load transactions." });
  }
});

module.exports = router;
