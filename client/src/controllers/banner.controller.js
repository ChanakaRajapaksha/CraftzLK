import { bannerEndpoints } from "../api/endpoint.js";
import { deleteData, editData, fetchDataFromApi, postData } from "../utils/api";

class BannerController {
  static getSlideBanners() {
    return fetchDataFromApi(bannerEndpoints.banners);
  }

  static getSideBanners() {
    return fetchDataFromApi(bannerEndpoints.side);
  }

  static getBottomBanners() {
    return fetchDataFromApi(bannerEndpoints.bottom);
  }

  static getHomeSliderBanners() {
    return fetchDataFromApi(bannerEndpoints.homeSlider);
  }

  static getHomeSliderById(id) {
    return fetchDataFromApi(bannerEndpoints.homeSliderById(id));
  }

  static createHomeSlider(payload) {
    return postData(bannerEndpoints.homeSliderCreate, payload);
  }

  static updateHomeSlider(id, payload) {
    return editData(bannerEndpoints.homeSliderById(id), payload);
  }

  static removeHomeSlider(id) {
    return deleteData(bannerEndpoints.homeSliderById(id));
  }
}

export default BannerController;
