import { categoryEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class CategoryController {
  static getActive() {
    return fetchDataFromApi(categoryEndpoints.active);
  }

  static getList() {
    return fetchDataFromApi(categoryEndpoints.list);
  }

  static getAdminList(params) {
    return fetchDataFromApi(withQuery(categoryEndpoints.adminList, params));
  }

  static getById(id) {
    return fetchDataFromApi(categoryEndpoints.byId(id));
  }

  static create(payload) {
    return postData(categoryEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(categoryEndpoints.byId(id), payload);
  }

  static remove(id) {
    return deleteData(categoryEndpoints.byId(id));
  }

  static getCount() {
    return fetchDataFromApi(categoryEndpoints.count);
  }

  static getSubCategoryCount() {
    return fetchDataFromApi(categoryEndpoints.subCatCount);
  }
}

export default CategoryController;
