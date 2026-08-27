import { homepageEndpoints } from "../api/endpoint.js";
import { editData, fetchDataFromApi } from "../utils/api";

class HomepageController {
  static getContent() {
    return fetchDataFromApi(homepageEndpoints.base);
  }

  static updateContent(payload) {
    return editData(homepageEndpoints.base, payload);
  }
}

export default HomepageController;
