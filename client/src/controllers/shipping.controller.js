import { shippingEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class ShippingController {
  static getActive() {
    return fetchDataFromApi(shippingEndpoints.active);
  }

  static getList() {
    return fetchDataFromApi(shippingEndpoints.base);
  }

  static getById(id) {
    return fetchDataFromApi(shippingEndpoints.byId(id));
  }

  static create(payload) {
    return postData(shippingEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(shippingEndpoints.byId(id), payload);
  }

  static remove(id) {
    return deleteData(shippingEndpoints.byId(id));
  }
}

export default ShippingController;
