import { productEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import {
  deleteData,
  deleteImages,
  editData,
  fetchDataFromApi,
  postData,
} from "../utils/api";

class ProductController {
  static list(params) {
    return fetchDataFromApi(withQuery(productEndpoints.base, params));
  }

  static getActive() {
    return fetchDataFromApi(productEndpoints.active);
  }

  static getAdminList(params) {
    return fetchDataFromApi(withQuery(productEndpoints.adminList, params));
  }

  static getFeatured(location) {
    return fetchDataFromApi(withQuery(productEndpoints.featured, { location: location ?? "" }));
  }

  static getById(id) {
    return fetchDataFromApi(productEndpoints.byId(id));
  }

  static getByCatId(params) {
    return fetchDataFromApi(withQuery(productEndpoints.byCatId, params));
  }

  static getBySubCatId(params) {
    return fetchDataFromApi(withQuery(productEndpoints.bySubCatId, params));
  }

  static filterByPrice(params) {
    return fetchDataFromApi(withQuery(productEndpoints.filterByPrice, params));
  }

  static filterByRating(params) {
    return fetchDataFromApi(withQuery(productEndpoints.byRating, params));
  }

  static create(payload) {
    return postData(productEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(productEndpoints.byId(id), payload);
  }

  static remove(id) {
    return deleteData(productEndpoints.byId(id));
  }

  static removeVariantOption(productId, optionId) {
    return deleteData(productEndpoints.variantOption(productId, optionId));
  }

  static bulkDelete(ids) {
    return postData(productEndpoints.bulkDelete, { ids });
  }

  static bulkUpdateStatus(ids, status) {
    return postData(productEndpoints.bulkStatus, { ids, status });
  }

  static deleteImage(img) {
    return deleteImages(`${productEndpoints.deleteImage}?img=${encodeURIComponent(img)}`);
  }
}

export default ProductController;
