/**
 * API endpoint path definitions only.
 * Use controllers in `src/controllers/` for request logic.
 */

const API = "/api";

export const authEndpoints = {
  base: `${API}/auth`,
  register: `${API}/auth/register`,
  login: `${API}/auth/login`,
  google: `${API}/auth/google`,
  logout: `${API}/auth/logout`,
  refreshToken: `${API}/auth/refresh-token`,
  requestPasswordReset: `${API}/auth/request-password-reset`,
  resetPassword: `${API}/auth/reset-password`,
  profile: `${API}/auth/profile`,
  changePassword: `${API}/auth/change-password`,
};

export const userEndpoints = {
  base: `${API}/user`,
  list: `${API}/user`,
  byId: (id) => `${API}/user/${id}`,
  verifyEmail: `${API}/user/verify-email`,
  verifyemail: `${API}/user/verifyemail`,
  changePassword: `${API}/user/forgotPassword/changePassword`,
  signup: `${API}/user/signup`,
  signin: `${API}/user/signin`,
  upload: `${API}/user/upload`,
  deleteImage: `${API}/user/deleteImage`,
  forgotPassword: `${API}/user/forgotPassword`,
};

export const settingsEndpoints = {
  base: `${API}/settings`,
  upload: (assetType) => `${API}/settings/upload/${assetType}`,
  deleteAsset: (assetType) => `${API}/settings/assets/${assetType}`,
};

export const categoryEndpoints = {
  base: `${API}/category`,
  list: `${API}/category`,
  active: `${API}/category/active`,
  adminList: `${API}/category/admin/list`,
  byId: (id) => `${API}/category/${id}`,
  create: `${API}/category/create`,
  count: `${API}/category/get/count`,
  subCatCount: `${API}/category/subCat/get/count`,
  upload: `${API}/category/upload`,
  deleteImage: `${API}/category/deleteImage`,
};

export const productEndpoints = {
  base: `${API}/products`,
  active: `${API}/products/active`,
  adminList: `${API}/products/admin/list`,
  featured: `${API}/products/featured`,
  byCatId: `${API}/products/catId`,
  bySubCatId: `${API}/products/subCatId`,
  filterByPrice: `${API}/products/fiterByPrice`,
  byRating: `${API}/products/rating`,
  byId: (id) => `${API}/products/${id}`,
  create: `${API}/products/create`,
  bulkDelete: `${API}/products/bulk/delete`,
  bulkStatus: `${API}/products/bulk/status`,
  upload: `${API}/products/upload`,
  deleteImage: `${API}/products/deleteImage`,
};

export const productAttributeEndpoints = {
  rams: `${API}/productRAMS`,
  weight: `${API}/productWeight`,
  size: `${API}/productSIZE`,
};

export const productReviewEndpoints = {
  base: `${API}/productReviews`,
  adminList: `${API}/productReviews/admin/list`,
  stats: `${API}/productReviews/stats`,
  getAll: `${API}/productReviews/getall`,
  add: `${API}/productReviews/add`,
  upload: `${API}/productReviews/upload`,
  approve: (id) => `${API}/productReviews/${id}/approve`,
  reject: (id) => `${API}/productReviews/${id}/reject`,
  byId: (id) => `${API}/productReviews/${id}`,
};

export const productQuestionEndpoints = {
  base: `${API}/productQuestions`,
  adminList: `${API}/productQuestions/admin/list`,
  add: `${API}/productQuestions/add`,
  answer: (id) => `${API}/productQuestions/${id}/answer`,
  approve: (id) => `${API}/productQuestions/${id}/approve`,
  byId: (id) => `${API}/productQuestions/${id}`,
};

export const searchEndpoints = {
  base: `${API}/search`,
  popular: `${API}/search/popular`,
};

export const cartEndpoints = {
  base: `${API}/cart`,
  add: `${API}/cart/add`,
  byId: (id) => `${API}/cart/${id}`,
};

export const myListEndpoints = {
  base: `${API}/my-list`,
  add: `${API}/my-list/add/`,
  byId: (id) => `${API}/my-list/${id}`,
};

export const compareListEndpoints = {
  base: `${API}/compare-list`,
  add: `${API}/compare-list/add/`,
  byId: (id) => `${API}/compare-list/${id}`,
};

export const compareEndpoints = {
  compareProducts: `${API}/compare-products`,
};

export const orderEndpoints = {
  base: `${API}/orders`,
  list: `${API}/orders/`,
  create: `${API}/orders/create`,
  byId: (id) => `${API}/orders/${id}`,
  sales: `${API}/orders/sales`,
};

export const couponEndpoints = {
  base: `${API}/coupons`,
  list: `${API}/coupons`,
  validate: `${API}/coupons/validate`,
  create: `${API}/coupons/create`,
  byId: (id) => `${API}/coupons/${id}`,
};

export const promoDiscountEndpoints = {
  base: `${API}/promo-discounts`,
  list: `${API}/promo-discounts`,
  create: `${API}/promo-discounts/create`,
  byId: (id) => `${API}/promo-discounts/${id}`,
};

export const shippingEndpoints = {
  base: `${API}/shipping-methods`,
  active: `${API}/shipping-methods/active`,
  create: `${API}/shipping-methods/create`,
  byId: (id) => `${API}/shipping-methods/${id}`,
};

export const paymentEndpoints = {
  base: `${API}/payments`,
  methods: `${API}/payments/methods`,
  methodById: (id) => `${API}/payments/methods/${id}`,
  publicBankTransfer: `${API}/payments/methods/public/bank-transfer`,
  transactions: `${API}/payments/transactions`,
};

export const cmsPageEndpoints = {
  base: `${API}/cms-pages`,
  list: `${API}/cms-pages`,
  create: `${API}/cms-pages/create`,
  public: `${API}/cms-pages/public`,
  publicNav: `${API}/cms-pages/public/nav`,
  publicBySlug: (slug) => `${API}/cms-pages/public/${slug}`,
  byId: (id) => `${API}/cms-pages/${id}`,
  status: (id) => `${API}/cms-pages/${id}/status`,
  upload: `${API}/cms-pages/upload`,
  deleteImage: `${API}/cms-pages/deleteImage`,
};

export const homepageEndpoints = {
  base: `${API}/homepage-content`,
  upload: `${API}/homepage-content/upload`,
  deleteImage: `${API}/homepage-content/deleteImage`,
  featuredProducts: `${API}/homepage-content/public/featured-products`,
  trendingProducts: `${API}/homepage-content/public/trending-products`,
  newArrivals: `${API}/homepage-content/public/new-arrivals`,
  bestSellers: `${API}/homepage-content/public/best-sellers`,
  popularCategories: `${API}/homepage-content/public/popular-categories`,
};

export const bannerEndpoints = {
  homeBanner: `${API}/homeBanner`,
  homeMain: `${API}/homeBanner`,
  banners: `${API}/banners`,
  list: `${API}/banners`,
  slide: `${API}/banners`,
  side: `${API}/homeSideBanners`,
  bottom: `${API}/homeBottomBanners`,
  homeSlider: `${API}/home-slider-banners`,
  homeSliderCreate: `${API}/home-slider-banners/create`,
  homeSliderById: (id) => `${API}/home-slider-banners/${id}`,
  homeSliderUpload: `${API}/home-slider-banners/upload`,
  homeSliderDeleteImage: `${API}/home-slider-banners/deleteImage`,
  promoBanners: `${API}/promo-banners`,
};

export const artisanEndpoints = {
  base: `${API}/artisans`,
  create: `${API}/artisans/create`,
  adminList: `${API}/artisans/admin/list`,
  byId: (id) => `${API}/artisans/${id}`,
  upload: `${API}/artisans/upload`,
  deleteImage: `${API}/artisans/deleteImage`,
};

export const customerEndpoints = {
  base: `${API}/customers`,
  list: `${API}/customers`,
  byId: (id) => `${API}/customers/${id}`,
};

export const inventoryEndpoints = {
  stock: `${API}/inventory/stock`,
  adjustments: `${API}/inventory/adjustments`,
  adjust: `${API}/inventory/adjust`,
};

export const dashboardEndpoints = {
  overview: `${API}/dashboard/overview`,
};

export const reportEndpoints = {
  sales: `${API}/reports/sales`,
  customers: `${API}/reports/customers`,
  products: `${API}/reports/products`,
  payments: `${API}/reports/payments`,
  inventory: `${API}/reports/inventory`,
  coupons: `${API}/reports/coupons`,
  orders: `${API}/reports/orders`,
  byType: (type) => `${API}/reports/${type}`,
  exportByType: (type) => `${API}/reports/${type}/export`,
};

export const notificationEndpoints = {
  settings: `${API}/notifications/settings`,
  templates: `${API}/notifications/templates`,
  templateById: (id) => `${API}/notifications/templates/${id}`,
};

export const adminNotificationEndpoints = {
  base: `${API}/admin-notifications`,
  list: `${API}/admin-notifications`,
  readAll: `${API}/admin-notifications/read-all`,
  byId: (id) => `${API}/admin-notifications/${id}`,
};

export const imageUploadEndpoints = {
  base: `${API}/imageUpload`,
  deleteAll: `${API}/imageUpload/deleteAllImages`,
};

export default {
  authEndpoints,
  userEndpoints,
  settingsEndpoints,
  categoryEndpoints,
  productEndpoints,
  productAttributeEndpoints,
  productReviewEndpoints,
  productQuestionEndpoints,
  searchEndpoints,
  cartEndpoints,
  myListEndpoints,
  compareListEndpoints,
  compareEndpoints,
  orderEndpoints,
  couponEndpoints,
  promoDiscountEndpoints,
  shippingEndpoints,
  paymentEndpoints,
  cmsPageEndpoints,
  homepageEndpoints,
  bannerEndpoints,
  artisanEndpoints,
  customerEndpoints,
  inventoryEndpoints,
  dashboardEndpoints,
  reportEndpoints,
  notificationEndpoints,
  adminNotificationEndpoints,
  imageUploadEndpoints,
};
