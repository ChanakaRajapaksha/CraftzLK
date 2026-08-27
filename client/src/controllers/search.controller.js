import { searchEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { fetchDataFromApi } from "../utils/api";

class SearchController {
  static search(query, limit) {
    const params = { q: query };
    if (limit != null) params.limit = limit;
    return fetchDataFromApi(withQuery(searchEndpoints.base, params));
  }

  static getPopular(limit = 8) {
    return fetchDataFromApi(withQuery(searchEndpoints.popular, { limit }));
  }
}

export default SearchController;
