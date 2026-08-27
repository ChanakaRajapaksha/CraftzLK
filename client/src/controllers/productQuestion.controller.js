import { productQuestionEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, fetchDataFromApi, patchData, postData } from "../utils/api";

class ProductQuestionController {
  static getList(params) {
    return fetchDataFromApi(withQuery(productQuestionEndpoints.base, params));
  }

  static getByProductId(productId) {
    return fetchDataFromApi(
      withQuery(productQuestionEndpoints.base, { productId: encodeURIComponent(productId) })
    );
  }

  static getAdminList() {
    return fetchDataFromApi(productQuestionEndpoints.adminList);
  }

  static add(payload) {
    return postData(productQuestionEndpoints.add, payload);
  }

  static answer(id, payload) {
    return patchData(productQuestionEndpoints.answer(id), payload);
  }

  static approve(id, payload) {
    return patchData(productQuestionEndpoints.approve(id), payload);
  }

  static remove(id) {
    return deleteData(productQuestionEndpoints.byId(id));
  }
}

export default ProductQuestionController;
