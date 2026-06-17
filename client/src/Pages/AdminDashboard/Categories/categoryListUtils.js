export const CATEGORY_LIST_SAMPLE = [
  {
    _id: "cat-demo-fashion",
    name: "Fashion",
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 0,
    status: "active",
    children: [
      {
        _id: "cat-demo-bags",
        name: "Handmade Bags",
        images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&h=200&fit=crop"],
        parentName: "Fashion",
        parentId: "cat-demo-fashion",
        productCount: 12,
        status: "active",
      },
      {
        _id: "cat-demo-jewelry",
        name: "Jewelry",
        images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop"],
        parentName: "Fashion",
        parentId: "cat-demo-fashion",
        productCount: 8,
        status: "active",
      },
    ],
  },
  {
    _id: "cat-demo-home",
    name: "Home Decor",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 15,
    status: "active",
    children: [],
  },
  {
    _id: "cat-demo-wood",
    name: "Woodcraft",
    images: ["https://images.unsplash.com/photo-1610701596007-3a61ce877b5d?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 6,
    status: "inactive",
    children: [],
  },
];

export function flattenCategories(categoryList) {
  const rows = [];

  (categoryList || []).forEach((main) => {
    rows.push({
      ...main,
      parentName: "—",
      parentId: main.parentId || null,
      isMain: true,
    });
    (main.children || []).forEach((sub) => {
      rows.push({
        ...sub,
        parentName: main.name,
        parentId: main._id || main.id,
        isMain: false,
      });
    });
  });

  return rows;
}

export function getCategoryListSampleData() {
  return flattenCategories(CATEGORY_LIST_SAMPLE.map((item) => ({ ...item, children: item.children?.map((c) => ({ ...c })) })));
}

export function isSampleCategoryId(id) {
  return String(id || "").startsWith("cat-demo-");
}

export function buildProductCountMap(products = []) {
  const map = {};

  products.forEach((product) => {
    const catId = product.catId || product.category?._id || product.category;
    const subCatId = product.subCatId;

    if (catId) map[catId] = (map[catId] || 0) + 1;
    if (subCatId) map[subCatId] = (map[subCatId] || 0) + 1;
  });

  return map;
}
