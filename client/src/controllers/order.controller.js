import { orderEndpoints } from "../api/endpoint.js";
import { editData, fetchDataFromApi, postData } from "../utils/api";

class OrderController {
  static getOrders() {
    return fetchDataFromApi(orderEndpoints.list);
  }

  static getById(id) {
    return fetchDataFromApi(orderEndpoints.byId(id));
  }

  static create(payload) {
    return postData(orderEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(orderEndpoints.byId(id), payload);
  }
}

export default OrderController;
