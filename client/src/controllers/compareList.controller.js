import { compareEndpoints, compareListEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, fetchDataFromApi, postData } from "../utils/api";

class CompareListController {
  static getList(params) {
    return fetchDataFromApi(withQuery(compareListEndpoints.base, params));
  }

  static check(productId, userId) {
    return fetchDataFromApi(
      withQuery(compareListEndpoints.base, { productId, userId: userId ?? "" })
    );
  }

  static addItem(payload) {
    return postData(compareListEndpoints.add, payload);
  }

  static remove(id) {
    return deleteData(compareListEndpoints.byId(id));
  }

  static compareProducts(payload) {
    return fetch(compareEndpoints.compareProducts, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}

export default CompareListController;
