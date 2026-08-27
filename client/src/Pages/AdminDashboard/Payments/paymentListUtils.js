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
    bankName: "Commercial Bank PLC",
    branchName: "Malabe Branch",
    accountName: "CraftzLK (Pvt) Ltd",
    accountNumber: "1234567890",
    status: "active",
  },
];

export function getPaymentMethodSampleData() {
  return SAMPLE_METHODS.map((item) => ({ ...item }));
}

export function isSamplePaymentMethodId(id) {
  return String(id || "").startsWith("sample-payment-");
}
