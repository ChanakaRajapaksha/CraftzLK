import { userEndpoints } from "../api/endpoint.js";
import { editData, fetchDataFromApi, postData } from "../utils/api";

class UserController {
  static getById(userId) {
    return fetchDataFromApi(userEndpoints.byId(userId));
  }

  static verifyEmail(payload) {
    return editData(userEndpoints.verifyEmail, payload);
  }

  static verifyOtp(payload) {
    return postData(userEndpoints.verifyemail, payload);
  }

  static changePassword(payload) {
    return postData(userEndpoints.changePassword, payload);
  }
}

export default UserController;
