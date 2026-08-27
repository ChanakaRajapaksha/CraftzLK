import { bannerEndpoints, productAttributeEndpoints } from "../../api/endpoint.js";

export const BANNER_MODULES = {
  homeMain: {
    key: "homeMain",
    title: "Home Main Banners",
    listPath: "/dashboard/homeBannerSlide/list",
    addPath: "/dashboard/homeBannerSlide/add",
    editPath: (id) => `/dashboard/homeBannerSlide/edit/${id}`,
    apiBase: bannerEndpoints.homeMain,
    hasCategoryFields: false,
  },
  slide: {
    key: "slide",
    title: "Home Slide Banners",
    listPath: "/dashboard/banners",
    addPath: "/dashboard/banners/add",
    editPath: (id) => `/dashboard/banners/edit/${id}`,
    apiBase: bannerEndpoints.slide,
    hasCategoryFields: true,
  },
  side: {
    key: "side",
    title: "Home Side Banners",
    listPath: "/dashboard/homeSideBanners",
    addPath: "/dashboard/homeSideBanners/add",
    editPath: (id) => `/dashboard/homeSideBanners/edit/${id}`,
    apiBase: bannerEndpoints.side,
    hasCategoryFields: false,
  },
  bottom: {
    key: "bottom",
    title: "Home Bottom Banners",
    listPath: "/dashboard/homeBottomBanners",
    addPath: "/dashboard/homeBottomBanners/add",
    editPath: (id) => `/dashboard/homeBottomBanners/edit/${id}`,
    apiBase: bannerEndpoints.bottom,
    hasCategoryFields: false,
  },
};

export const PRODUCT_ATTRIBUTE_MODULES = {
  rams: {
    title: "Product RAM",
    apiBase: productAttributeEndpoints.rams,
    fieldName: "productRam",
    fieldLabel: "Product RAM",
    breadcrumb: "Product RAM",
  },
  weight: {
    title: "Product Weight",
    apiBase: productAttributeEndpoints.weight,
    fieldName: "productWeight",
    fieldLabel: "Product Weight",
    breadcrumb: "Product Weight",
  },
  size: {
    title: "Product Size",
    apiBase: productAttributeEndpoints.size,
    fieldName: "size",
    fieldLabel: "Product Size",
    breadcrumb: "Product Size",
  },
};
