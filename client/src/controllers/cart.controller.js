import { cartEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class CartController {
  static getCart(params) {
    const url = params ? withQuery(cartEndpoints.base, params) : cartEndpoints.base;
    return fetchDataFromApi(url);
  }

  static addItem(payload) {
    return postData(cartEndpoints.add, payload);
  }

  static updateItem(id, payload) {
    return editData(cartEndpoints.byId(id), payload);
  }

  static removeItem(id) {
    return deleteData(cartEndpoints.byId(id));
  }
}

export default CartController;
