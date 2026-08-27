import { notificationEndpoints } from "../api/endpoint.js";
import { editData, fetchDataFromApi } from "../utils/api";

class NotificationController {
  static getSettings() {
    return fetchDataFromApi(notificationEndpoints.settings);
  }

  static updateSettings(payload) {
    return editData(notificationEndpoints.settings, payload);
  }

  static getTemplates() {
    return fetchDataFromApi(notificationEndpoints.templates);
  }

  static getTemplateById(id) {
    return fetchDataFromApi(notificationEndpoints.templateById(id));
  }

  static updateTemplate(id, payload) {
    return editData(notificationEndpoints.templateById(id), payload);
  }
}

export default NotificationController;
