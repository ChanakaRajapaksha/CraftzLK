import { customerEndpoints } from "../api/endpoint.js";
import { fetchDataFromApi } from "../utils/api";

class CustomerController {
  static getList() {
    return fetchDataFromApi(customerEndpoints.list);
  }

  static getById(id) {
    return fetchDataFromApi(customerEndpoints.byId(id));
  }
}

export default CustomerController;
