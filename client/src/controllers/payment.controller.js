import { paymentEndpoints } from "../api/endpoint.js";
import { editData, fetchDataFromApi } from "../utils/api";

class PaymentController {
  static getMethods() {
    return fetchDataFromApi(paymentEndpoints.methods);
  }

  static getMethodById(id) {
    return fetchDataFromApi(paymentEndpoints.methodById(id));
  }

  static updateMethod(id, payload) {
    return editData(paymentEndpoints.methodById(id), payload);
  }

  static getPublicBankTransfer() {
    return fetchDataFromApi(paymentEndpoints.publicBankTransfer);
  }

  static getTransactions() {
    return fetchDataFromApi(paymentEndpoints.transactions);
  }
}

export default PaymentController;
