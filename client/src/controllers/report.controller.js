import { reportEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { downloadFileFromApi, fetchDataFromApi } from "../utils/api";

class ReportController {
  static getByType(type, params) {
    return fetchDataFromApi(withQuery(reportEndpoints.byType(type), params));
  }

  static getSales(params) {
    return fetchDataFromApi(withQuery(reportEndpoints.sales, params));
  }

  static getProducts(params) {
    return fetchDataFromApi(withQuery(reportEndpoints.products, params));
  }

  static getCustomers(params) {
    return fetchDataFromApi(withQuery(reportEndpoints.customers, params));
  }

  static export(type, params, fallbackFilename) {
    return downloadFileFromApi(
      withQuery(reportEndpoints.exportByType(type), params),
      fallbackFilename
    );
  }
}

export default ReportController;
