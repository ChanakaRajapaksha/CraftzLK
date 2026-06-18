export const CATEGORY_LIST_SAMPLE = [
  {
    _id: "cat-demo-fashion",
    name: "Fashion",
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 24,
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
    children: [
      {
        _id: "cat-demo-ceramics",
        name: "Ceramics",
        images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b25?w=200&h=200&fit=crop"],
        parentName: "Home Decor",
        parentId: "cat-demo-home",
        productCount: 9,
        status: "active",
      },
      {
        _id: "cat-demo-candles",
        name: "Candles",
        images: ["https://images.unsplash.com/photo-1602602898654-9a8b0a4b0b0b?w=200&h=200&fit=crop"],
        parentName: "Home Decor",
        parentId: "cat-demo-home",
        productCount: 6,
        status: "inactive",
      },
    ],
  },
  {
    _id: "cat-demo-wood",
    name: "Woodcraft",
    images: ["https://images.unsplash.com/photo-1610701596007-3a61ce877b5d?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 11,
    status: "active",
    children: [
      {
        _id: "cat-demo-furniture",
        name: "Furniture",
        images: ["https://images.unsplash.com/photo-1555041467-a586c64e9f9e?w=200&h=200&fit=crop"],
        parentName: "Woodcraft",
        parentId: "cat-demo-wood",
        productCount: 5,
        status: "active",
      },
      {
        _id: "cat-demo-utensils",
        name: "Kitchen Utensils",
        images: ["https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop"],
        parentName: "Woodcraft",
        parentId: "cat-demo-wood",
        productCount: 6,
        status: "active",
      },
    ],
  },
  {
    _id: "cat-demo-textiles",
    name: "Textiles",
    images: ["https://images.unsplash.com/photo-1558171813-1c472706498a?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 18,
    status: "active",
    children: [
      {
        _id: "cat-demo-batik",
        name: "Batik",
        images: ["https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=200&h=200&fit=crop"],
        parentName: "Textiles",
        parentId: "cat-demo-textiles",
        productCount: 10,
        status: "active",
      },
      {
        _id: "cat-demo-lace",
        name: "Lace & Embroidery",
        images: ["https://images.unsplash.com/photo-1586075010923-2dd457fb0c71?w=200&h=200&fit=crop"],
        parentName: "Textiles",
        parentId: "cat-demo-textiles",
        productCount: 8,
        status: "active",
      },
    ],
  },
  {
    _id: "cat-demo-art",
    name: "Art & Crafts",
    images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 14,
    status: "active",
    children: [
      {
        _id: "cat-demo-paintings",
        name: "Paintings",
        images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop"],
        parentName: "Art & Crafts",
        parentId: "cat-demo-art",
        productCount: 7,
        status: "active",
      },
      {
        _id: "cat-demo-pottery",
        name: "Pottery",
        images: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop"],
        parentName: "Art & Crafts",
        parentId: "cat-demo-art",
        productCount: 7,
        status: "inactive",
      },
    ],
  },
  {
    _id: "cat-demo-gifts",
    name: "Gifts",
    images: ["https://images.unsplash.com/photo-1549465220-1a0b9238e9f0?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 20,
    status: "active",
    children: [
      {
        _id: "cat-demo-corporate",
        name: "Corporate Gifts",
        images: ["https://images.unsplash.com/photo-1513885535756-8a1b06e45773?w=200&h=200&fit=crop"],
        parentName: "Gifts",
        parentId: "cat-demo-gifts",
        productCount: 11,
        status: "active",
      },
      {
        _id: "cat-demo-seasonal",
        name: "Seasonal Gifts",
        images: ["https://images.unsplash.com/photo-1482517967863-00e0888a0e71?w=200&h=200&fit=crop"],
        parentName: "Gifts",
        parentId: "cat-demo-gifts",
        productCount: 9,
        status: "active",
      },
    ],
  },
  {
    _id: "cat-demo-soaps",
    name: "Organic Soaps",
    images: ["https://images.unsplash.com/photo-1600857062241-98e5dba7af9f?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 13,
    status: "active",
    children: [],
  },
  {
    _id: "cat-demo-stationery",
    name: "Stationery",
    images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200&h=200&fit=crop"],
    parentName: "—",
    parentId: null,
    productCount: 7,
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
  return flattenCategories(
    CATEGORY_LIST_SAMPLE.map((item) => ({
      ...item,
      children: item.children?.map((c) => ({ ...c })),
    }))
  );
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
