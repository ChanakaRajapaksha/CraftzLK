const SAMPLE_METHODS = [
  {
    _id: "sample-payment-cod",
    id: "sample-payment-cod",
    code: "cod",
    name: "Cash on Delivery",
    description: "Pay with cash when your order is delivered.",
    status: "active",
  },
  {
    _id: "sample-payment-bank",
    id: "sample-payment-bank",
    code: "bank_transfer",
    name: "Bank Transfer",
    description: "Transfer payment to our bank account and email the slip with your order number.",
    bankName: "Commercial Bank",
    accountName: "CraftzLK Pvt Ltd",
    accountNumber: "1234567890",
    status: "active",
  },
];

const SAMPLE_TRANSACTIONS = [
  {
    _id: "sample-txn-1",
    id: "sample-txn-1",
    transactionId: "COD-20250617-001",
    orderId: "ORD-1042",
    orderLabel: "ORD-1042",
    amount: 4850,
    currency: "LKR",
    status: "pending",
    paymentMethod: "cod",
    date: "2025-06-17T09:30:00.000Z",
  },
  {
    _id: "sample-txn-2",
    id: "sample-txn-2",
    transactionId: "BANK-20250616-002",
    orderId: "ORD-1041",
    orderLabel: "ORD-1041",
    amount: 12750,
    currency: "LKR",
    status: "success",
    paymentMethod: "bank_transfer",
    date: "2025-06-16T14:15:00.000Z",
  },
  {
    _id: "sample-txn-3",
    id: "sample-txn-3",
    transactionId: "PAYHERE-883921",
    orderId: "ORD-1040",
    orderLabel: "ORD-1040",
    amount: 6200,
    currency: "LKR",
    status: "success",
    paymentMethod: "card",
    date: "2025-06-15T11:00:00.000Z",
  },
  {
    _id: "sample-txn-4",
    id: "sample-txn-4",
    transactionId: "COD-20250614-003",
    orderId: "ORD-1039",
    orderLabel: "ORD-1039",
    amount: 3100,
    currency: "LKR",
    status: "failed",
    paymentMethod: "cod",
    date: "2025-06-14T16:45:00.000Z",
  },
  {
    _id: "sample-txn-5",
    id: "sample-txn-5",
    transactionId: "BANK-20250613-004",
    orderId: "ORD-1038",
    orderLabel: "ORD-1038",
    amount: 8900,
    currency: "LKR",
    status: "refunded",
    paymentMethod: "bank_transfer",
    date: "2025-06-13T08:20:00.000Z",
  },
];

export function getPaymentMethodSampleData() {
  return SAMPLE_METHODS.map((item) => ({ ...item }));
}

export function getTransactionSampleData() {
  return SAMPLE_TRANSACTIONS.map((item) => ({ ...item }));
}

export function isSamplePaymentMethodId(id) {
  return String(id || "").startsWith("sample-payment-");
}

export function isSampleTransactionId(id) {
  return String(id || "").startsWith("sample-txn-");
}
