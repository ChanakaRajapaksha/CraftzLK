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
      { label: "Add Category", path: `${ADMIN_BASE}/category?action=add` },
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
    key: "orders",
    label: "Orders",
    children: [
      { label: "Order List", path: `${ADMIN_BASE}/orders` },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    children: [
      { label: "Customer List", path: `${ADMIN_BASE}/customers` },
    ],
  },
  {
    key: "promotions",
    label: "Promotions & Marketing",
    children: [
      { label: "Coupon List", path: `${ADMIN_BASE}/promotions/coupons` },
      { label: "Add Coupon", path: `${ADMIN_BASE}/promotions/coupons/add` },
      { label: "Discounts", path: `${ADMIN_BASE}/promotions/discounts` },
      { label: "Create Discount", path: `${ADMIN_BASE}/promotions/discounts/add` },
      { label: "Banner List", path: `${ADMIN_BASE}/promotions/banners` },
      { label: "Add Banner", path: `${ADMIN_BASE}/promotions/banners/add` },
    ],
  },
  {
    key: "homepage",
    label: "Homepage Content",
    children: [
      { label: "Homepage Sections", path: `${ADMIN_BASE}/homepage` },
      { label: "Featured Products", path: `${ADMIN_BASE}/homepage/featured` },
      { label: "Trending Products", path: `${ADMIN_BASE}/homepage/trending` },
      { label: "New Arrivals", path: `${ADMIN_BASE}/homepage/new-arrivals` },
      { label: "Best Sellers", path: `${ADMIN_BASE}/homepage/best-sellers` },
      { label: "Popular Categories", path: `${ADMIN_BASE}/homepage/popular-categories` },
    ],
  },
  {
    key: "reviews",
    label: "Review Management",
    children: [
      { label: "Reviews List", path: `${ADMIN_BASE}/reviews` },
    ],
  },
  {
    key: "inventory",
    label: "Inventory Management",
    children: [
      { label: "Stock List", path: `${ADMIN_BASE}/inventory/stock` },
      { label: "Stock Adjustment", path: `${ADMIN_BASE}/inventory/adjust` },
    ],
  },
  {
    key: "shipping",
    label: "Shipping Management",
    children: [
      { label: "Shipping Methods", path: `${ADMIN_BASE}/shipping/methods` },
      { label: "Add Shipping Method", path: `${ADMIN_BASE}/shipping/methods/add` },
    ],
  },
  {
    key: "payments",
    label: "Payment Management",
    children: [
      { label: "Payment Methods", path: `${ADMIN_BASE}/payments/methods` },
      { label: "Transactions", path: `${ADMIN_BASE}/payments/transactions` },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    children: [
      { label: "Sales Reports", path: `${ADMIN_BASE}/reports/sales` },
      { label: "Product Reports", path: `${ADMIN_BASE}/reports/products` },
      { label: "Customer Reports", path: `${ADMIN_BASE}/reports/customers` },
    ],
  },
  {
    key: "cms",
    label: "CMS Pages",
    children: [
      { label: "Pages", path: `${ADMIN_BASE}/cms/pages` },
      { label: "Add Page", path: `${ADMIN_BASE}/cms/pages/add` },
    ],
  },
  {
    key: "notifications",
    label: "Notification Management",
    children: [
      { label: "Notifications", path: `${ADMIN_BASE}/notifications` },
      { label: "Templates", path: `${ADMIN_BASE}/notifications/templates` },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    children: [
      { label: "General Settings", path: `${ADMIN_BASE}/settings` },
    ],
  },
];
