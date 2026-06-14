export const BANNER_MODULES = {
  homeMain: {
    key: "homeMain",
    title: "Home Main Banners",
    listPath: "/dashboard/homeBannerSlide/list",
    addPath: "/dashboard/homeBannerSlide/add",
    editPath: (id) => `/dashboard/homeBannerSlide/edit/${id}`,
    apiBase: "/api/homeBanner",
    hasCategoryFields: false,
  },
  slide: {
    key: "slide",
    title: "Home Slide Banners",
    listPath: "/dashboard/banners",
    addPath: "/dashboard/banners/add",
    editPath: (id) => `/dashboard/banners/edit/${id}`,
    apiBase: "/api/banners",
    hasCategoryFields: true,
  },
  side: {
    key: "side",
    title: "Home Side Banners",
    listPath: "/dashboard/homeSideBanners",
    addPath: "/dashboard/homeSideBanners/add",
    editPath: (id) => `/dashboard/homeSideBanners/edit/${id}`,
    apiBase: "/api/homeSideBanners",
    hasCategoryFields: false,
  },
  bottom: {
    key: "bottom",
    title: "Home Bottom Banners",
    listPath: "/dashboard/homeBottomBanners",
    addPath: "/dashboard/homeBottomBanners/add",
    editPath: (id) => `/dashboard/homeBottomBanners/edit/${id}`,
    apiBase: "/api/homeBottomBanners",
    hasCategoryFields: false,
  },
};

export const PRODUCT_ATTRIBUTE_MODULES = {
  rams: {
    title: "Product RAM",
    apiBase: "/api/productRAMS",
    fieldName: "productRam",
    fieldLabel: "Product RAM",
    breadcrumb: "Product RAM",
  },
  weight: {
    title: "Product Weight",
    apiBase: "/api/productWeight",
    fieldName: "productWeight",
    fieldLabel: "Product Weight",
    breadcrumb: "Product Weight",
  },
  size: {
    title: "Product Size",
    apiBase: "/api/productSIZE",
    fieldName: "size",
    fieldLabel: "Product Size",
    breadcrumb: "Product Size",
  },
};
