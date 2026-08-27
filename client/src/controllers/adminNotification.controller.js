import { adminNotificationEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi } from "../utils/api";

class AdminNotificationController {
  static getList() {
    return fetchDataFromApi(adminNotificationEndpoints.list);
  }

  static markAllRead() {
    return editData(adminNotificationEndpoints.readAll, {});
  }

  static remove(id) {
    return deleteData(adminNotificationEndpoints.byId(id));
  }
}

export default AdminNotificationController;
