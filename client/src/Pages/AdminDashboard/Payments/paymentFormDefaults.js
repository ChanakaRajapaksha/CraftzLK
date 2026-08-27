export const PAYMENT_METHOD_CODES = {
  cod: "cod",
  bank_transfer: "bank_transfer",
};

export const defaultPaymentMethodFields = {
  name: "",
  description: "",
  bankName: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  status: "active",
};

export function methodFromRecord(record) {
  return {
    name: record.name || "",
    description: record.description || "",
    bankName: record.bankName || "",
    branchName: record.branchName || "",
    accountName: record.accountName || "",
    accountNumber: record.accountNumber || "",
    status: record.status || "active",
  };
}

export function formToPayload(formFields) {
  return {
    name: formFields.name,
    description: formFields.description || "",
    bankName: formFields.bankName || "",
    branchName: formFields.branchName || "",
    accountName: formFields.accountName || "",
    accountNumber: formFields.accountNumber || "",
    status: formFields.status || "active",
  };
}

export function getMethodCodeLabel(code) {
  const map = {
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
  };
  return map[code] || code || "—";
}
