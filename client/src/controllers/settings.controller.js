import { settingsEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi, uploadImage } from "../utils/api";

class SettingsController {
  static getSettings() {
    return fetchDataFromApi(settingsEndpoints.base);
  }

  static updateSettings(payload) {
    return editData(settingsEndpoints.base, payload);
  }

  static uploadAsset(variant, formData) {
    return uploadImage(settingsEndpoints.upload(variant), formData);
  }

  static deleteAsset(variant) {
    return deleteData(settingsEndpoints.deleteAsset(variant));
  }
}

export default SettingsController;
