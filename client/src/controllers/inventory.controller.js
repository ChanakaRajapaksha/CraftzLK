import { inventoryEndpoints } from "../api/endpoint.js";
import { fetchDataFromApi, postData } from "../utils/api";

class InventoryController {
  static getStock() {
    return fetchDataFromApi(inventoryEndpoints.stock);
  }

  static getAdjustments() {
    return fetchDataFromApi(inventoryEndpoints.adjustments);
  }

  static adjust(payload) {
    return postData(inventoryEndpoints.adjust, payload);
  }
}

export default InventoryController;
