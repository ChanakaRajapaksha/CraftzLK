import { cmsPageEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi, patchData, postData } from "../utils/api";

class CmsController {
  static getList() {
    return fetchDataFromApi(cmsPageEndpoints.list);
  }

  static getPublicNav() {
    return fetchDataFromApi(cmsPageEndpoints.publicNav);
  }

  static getPublicBySlug(slug) {
    return fetchDataFromApi(cmsPageEndpoints.publicBySlug(slug));
  }

  static getById(id) {
    return fetchDataFromApi(cmsPageEndpoints.byId(id));
  }

  static create(payload) {
    return postData(cmsPageEndpoints.create, payload);
  }

  static update(id, payload) {
    return editData(cmsPageEndpoints.byId(id), payload);
  }

  static updateStatus(id, status) {
    return patchData(cmsPageEndpoints.status(id), { status });
  }

  static remove(id) {
    return deleteData(cmsPageEndpoints.byId(id));
  }
}

export default CmsController;
