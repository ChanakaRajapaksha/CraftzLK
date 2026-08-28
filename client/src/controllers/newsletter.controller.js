import { newsletterEndpoints } from "../api/endpoint.js";
import { fetchDataFromApi, getDataFromApi, postData } from "../utils/api";
import { withQuery } from "../api/query.js";

class NewsletterController {
  static subscribe(email, source = "Footer") {
    return postData(newsletterEndpoints.subscribe, { email, source });
  }

  static getStatus(email) {
    return postData(newsletterEndpoints.status, { email });
  }

  static resendConfirmation(email) {
    return postData(newsletterEndpoints.resendConfirmation, { email });
  }

  static confirm(token) {
    return getDataFromApi(withQuery(newsletterEndpoints.confirm, { token }));
  }

  static unsubscribe(token) {
    return postData(newsletterEndpoints.unsubscribe, { token });
  }

  static unsubscribeByLink(token) {
    return getDataFromApi(withQuery(newsletterEndpoints.unsubscribe, { token }));
  }

  static getSubscribers() {
    return fetchDataFromApi(newsletterEndpoints.base);
  }
}

export default NewsletterController;
