import { artisanEndpoints } from "../api/endpoint.js";
import { withQuery } from "../api/query.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class ArtisanController {
  static getAdminList(params) {
    return fetchDataFromApi(withQuery(artisanEndpoints.adminList, params));
  }

  static getById(id) {
    return fetchDataFromApi(artisanEndpoints.byId(id));
  }

  static create(payload) {
    return postData(artisanEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(artisanEndpoints.byId(id), payload);
  }

  static remove(id) {
    return deleteData(artisanEndpoints.byId(id));
  }
}

export default ArtisanController;
