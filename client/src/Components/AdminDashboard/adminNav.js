export const ADMIN_BASE = "/dashboard";

export const adminNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    children: [
      { label: "Dashboard Home", path: ADMIN_BASE },
      { label: "Sales Analytics", path: `${ADMIN_BASE}?tab=sales` },
      { label: "Store Performance", path: `${ADMIN_BASE}?tab=performance` },
    ],
  },
  {
    key: "category",
    label: "Category",
    children: [
      { label: "Category List", path: `${ADMIN_BASE}/category` },
      { label: "Add Category", path: `${ADMIN_BASE}/category/add` },
      { label: "Sub Category List", path: `${ADMIN_BASE}/subCategory` },
      { label: "Add Sub Category", path: `${ADMIN_BASE}/subCategory/add` },
    ],
  },
  {
    key: "products",
    label: "Products",
    children: [
      { label: "Product List", path: `${ADMIN_BASE}/products` },
      { label: "Product Upload", path: `${ADMIN_BASE}/product/upload` },
      { label: "Add Product RAM", path: `${ADMIN_BASE}/productRAMS/add` },
      { label: "Add Product Weight", path: `${ADMIN_BASE}/productWEIGHT/add` },
      { label: "Add Product Size", path: `${ADMIN_BASE}/productSIZE/add` },
    ],
  },
  {
    key: "mainBanners",
    label: "Home Main Banners",
    children: [
      { label: "Banner List", path: `${ADMIN_BASE}/homeBannerSlide/list` },
      { label: "Banner Upload", path: `${ADMIN_BASE}/homeBannerSlide/add` },
    ],
  },
  {
    key: "slideBanners",
    label: "Home Slide Banners",
    children: [
      { label: "Banners List", path: `${ADMIN_BASE}/banners` },
      { label: "Banner Upload", path: `${ADMIN_BASE}/banners/add` },
    ],
  },
  {
    key: "sideBanners",
    label: "Home Side Banners",
    children: [
      { label: "Banners List", path: `${ADMIN_BASE}/homeSideBanners` },
      { label: "Banner Upload", path: `${ADMIN_BASE}/homeSideBanners/add` },
    ],
  },
  {
    key: "bottomBanners",
    label: "Home Bottom Banners",
    children: [
      { label: "Banners List", path: `${ADMIN_BASE}/homeBottomBanners` },
      { label: "Banner Upload", path: `${ADMIN_BASE}/homeBottomBanners/add` },
    ],
  },
  { key: "orders", label: "Orders", path: `${ADMIN_BASE}/orders` },
];
