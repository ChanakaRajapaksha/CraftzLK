import { promoDiscountEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class PromoDiscountController {
  static getList() {
    return fetchDataFromApi(promoDiscountEndpoints.list);
  }

  static getById(id) {
    return fetchDataFromApi(promoDiscountEndpoints.byId(id));
  }

  static create(payload) {
    return postData(promoDiscountEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(promoDiscountEndpoints.byId(id), payload);
  }

  static remove(id) {
    return deleteData(promoDiscountEndpoints.byId(id));
  }
}

export default PromoDiscountController;
