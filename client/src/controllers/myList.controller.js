import { myListEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, fetchDataFromApi, postData } from "../utils/api";

class MyListController {
  static getList(params) {
    return fetchDataFromApi(withQuery(myListEndpoints.base, params));
  }

  static check(productId, userId) {
    return fetchDataFromApi(
      withQuery(myListEndpoints.base, { productId, userId: userId ?? "" })
    );
  }

  static addItem(payload) {
    return postData(myListEndpoints.add, payload);
  }

  static remove(id) {
    return deleteData(myListEndpoints.byId(id));
  }
}

export default MyListController;
