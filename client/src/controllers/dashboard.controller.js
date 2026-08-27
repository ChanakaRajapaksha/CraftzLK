import { dashboardEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { fetchDataFromApi } from "../utils/api";

class DashboardController {
  static getOverview(params) {
    return fetchDataFromApi(withQuery(dashboardEndpoints.overview, params));
  }
}

export default DashboardController;
