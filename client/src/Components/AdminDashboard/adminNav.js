export const ADMIN_BASE = "/dashboard";

export const adminNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: ADMIN_BASE,
    end: true,
  },
  {
    key: "products",
    label: "Products",
    children: [
      { label: "Product List", path: `${ADMIN_BASE}/products` },
      { label: "Add Product", path: `${ADMIN_BASE}/product/upload` },
    ],
  },
  {
    key: "category",
    label: "Category",
    children: [
      { label: "Category List", path: `${ADMIN_BASE}/category` },
      { label: "Add Category", path: `${ADMIN_BASE}/category/add` },
    ],
  },
  {
    key: "artisans",
    label: "Brand / Artisan",
    children: [
      { label: "Artisan List", path: `${ADMIN_BASE}/artisans` },
      { label: "Add Artisan", path: `${ADMIN_BASE}/artisans/add` },
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
