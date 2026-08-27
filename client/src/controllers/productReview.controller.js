import { productReviewEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, fetchDataFromApi, patchData, postData, uploadImage } from "../utils/api";

class ProductReviewController {
  static getList(params) {
    return fetchDataFromApi(withQuery(productReviewEndpoints.base, params));
  }

  static getByProductId(productId) {
    return fetchDataFromApi(withQuery(productReviewEndpoints.base, { productId }));
  }

  static getStats() {
    return fetchDataFromApi(productReviewEndpoints.stats);
  }

  static getAll(params) {
    return fetchDataFromApi(withQuery(productReviewEndpoints.getAll, params));
  }

  static getAdminList() {
    return fetchDataFromApi(productReviewEndpoints.adminList);
  }

  static add(payload) {
    return postData(productReviewEndpoints.add, payload);
  }

  static upload(formData) {
    return uploadImage(productReviewEndpoints.upload, formData);
  }

  static approve(id) {
    return patchData(productReviewEndpoints.approve(id), {});
  }

  static reject(id) {
    return patchData(productReviewEndpoints.reject(id), {});
  }

  static remove(id) {
    return deleteData(productReviewEndpoints.byId(id));
  }
}

export default ProductReviewController;
