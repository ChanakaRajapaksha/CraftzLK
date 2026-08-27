import { imageUploadEndpoints } from "../api/endpoint.js";
import { deleteData, fetchDataFromApi } from "../utils/api";

class ImageUploadController {
  static getStagingImages() {
    return fetchDataFromApi(imageUploadEndpoints.base);
  }

  static clearStagingImages() {
    return deleteData(imageUploadEndpoints.deleteAll);
  }
}

export default ImageUploadController;
