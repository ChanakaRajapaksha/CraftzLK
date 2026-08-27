import { couponEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class CouponController {
  static getList() {
    return fetchDataFromApi(couponEndpoints.list);
  }

  static getById(id) {
    return fetchDataFromApi(couponEndpoints.byId(id));
  }

  static validate(payload) {
    return postData(couponEndpoints.validate, payload);
  }

  static create(payload) {
    return postData(couponEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(couponEndpoints.byId(id), payload);
  }

  static remove(id) {
    return deleteData(couponEndpoints.byId(id));
  }
}

export default CouponController;
