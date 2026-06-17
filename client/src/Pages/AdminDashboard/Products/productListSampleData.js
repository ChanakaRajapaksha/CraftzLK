/** Demo products for admin Product List when no live data is available */

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

export const PRODUCT_LIST_SAMPLE = [
  {
    _id: "sample-p1",
    id: "sample-p1",
    name: "Handmade Candle",
    sku: "HL-CND-001",
    catId: "cat-demo-1",
    catName: "Home Decor",
    brand: "CraftzLK",
    price: 1800,
    countInStock: 3,
    minStockAlert: 5,
    status: "active",
    isFeatured: true,
    dateCreated: daysAgo(2),
    images: ["https://images.unsplash.com/photo-1602607759136-9e77b5c5d0b0?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p2",
    id: "sample-p2",
    name: "Wooden Box",
    sku: "HL-WBX-002",
    catId: "cat-demo-2",
    catName: "Woodcraft",
    brand: "CraftzLK",
    price: 4500,
    countInStock: 18,
    minStockAlert: 5,
    status: "active",
    isFeatured: true,
    dateCreated: daysAgo(5),
    images: ["https://images.unsplash.com/photo-1610701596007-3a61ce877b5d?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p3",
    id: "sample-p3",
    name: "Kandyan Handloom Saree",
    sku: "HL-TLX-003",
    catId: "cat-demo-3",
    catName: "Handloom Textiles",
    brand: "Heritage Loom",
    price: 12500,
    countInStock: 24,
    minStockAlert: 5,
    status: "active",
    isFeatured: false,
    dateCreated: daysAgo(8),
    images: ["https://images.unsplash.com/photo-1610030469667-1ccfc00d50bf?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p4",
    id: "sample-p4",
    name: "Silver Filigree Pendant",
    sku: "HL-JWL-004",
    catId: "cat-demo-4",
    catName: "Jewellery",
    brand: "Artisan Silver",
    price: 15600,
    countInStock: 15,
    minStockAlert: 5,
    status: "active",
    isFeatured: true,
    dateCreated: daysAgo(12),
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p5",
    id: "sample-p5",
    name: "Woven Bamboo Basket Set",
    sku: "HL-BMB-005",
    catId: "cat-demo-5",
    catName: "Bamboo Crafts",
    brand: "CraftzLK",
    price: 3200,
    countInStock: 2,
    minStockAlert: 5,
    status: "active",
    isFeatured: false,
    dateCreated: daysAgo(15),
    images: ["https://images.unsplash.com/photo-1595428774223-ef5262410887?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p6",
    id: "sample-p6",
    name: "Clay Lotus Vase",
    sku: "HL-POT-006",
    catId: "cat-demo-6",
    catName: "Pottery",
    brand: "Earth & Clay",
    price: 4500,
    countInStock: 0,
    minStockAlert: 5,
    status: "inactive",
    isFeatured: false,
    dateCreated: daysAgo(20),
    images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p7",
    id: "sample-p7",
    name: "Heritage Batik Wall Hanging",
    sku: "HL-BTK-007",
    catId: "cat-demo-3",
    catName: "Handloom Textiles",
    brand: "CraftzLK",
    price: 7800,
    countInStock: 12,
    minStockAlert: 5,
    status: "active",
    isFeatured: false,
    dateCreated: daysAgo(25),
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop"],
  },
  {
    _id: "sample-p8",
    id: "sample-p8",
    name: "Wooden Tray",
    sku: "HL-WTR-008",
    catId: "cat-demo-2",
    catName: "Woodcraft",
    brand: "CraftzLK",
    price: 5200,
    countInStock: 2,
    minStockAlert: 5,
    status: "active",
    isFeatured: false,
    dateCreated: daysAgo(30),
    images: ["https://images.unsplash.com/photo-1615485290382-441d4c074cee?w=200&h=200&fit=crop"],
  },
];

export function getProductListSampleData() {
  return PRODUCT_LIST_SAMPLE.map((p) => ({ ...p }));
}

export function isSampleProductId(id) {
  return String(id || "").startsWith("sample-");
}

const SAMPLE_DETAIL_DEFAULTS = {
  shortDescription: "Handcrafted with care by Sri Lankan artisans.",
  description:
    "This product is part of the CraftzLK demo catalog. It showcases how product details appear in the admin dashboard, including pricing, inventory, and imagery.",
  oldPrice: 0,
  discount: 0,
  discountPrice: 0,
  discountType: "percentage",
  subCatName: "",
  subCat: "",
  stockStatus: "in_stock",
  rating: 4.5,
  productRam: [],
  size: [],
  productWeight: [],
  location: "All",
  variants: [],
  customizationOptions: [],
  shipping: {
    weight: 0.5,
    length: 20,
    width: 15,
    height: 10,
    freeShipping: false,
    shippingCharge: 350,
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getSampleProductById(id) {
  const base = PRODUCT_LIST_SAMPLE.find((p) => (p.id || p._id) === id);
  if (!base) return null;

  const oldPrice = base.oldPrice ?? Math.round(base.price * 1.15);
  const discount = base.discount ?? (oldPrice > base.price ? Math.round(((oldPrice - base.price) / oldPrice) * 100) : 0);

  return {
    ...SAMPLE_DETAIL_DEFAULTS,
    ...base,
    slug: slugify(base.name),
    shortDescription: base.shortDescription || `${base.name} — ${base.catName} from ${base.brand || "CraftzLK"}.`,
    oldPrice,
    discount,
    discountPrice: Math.max(0, oldPrice - base.price),
    stockStatus: base.countInStock > 0 ? "in_stock" : "out_of_stock",
    seo: {
      metaTitle: base.name,
      metaDescription: `${base.name} available on CraftzLK.`,
      keywords: [base.catName, base.brand, "handmade", "Sri Lanka"].filter(Boolean).join(", "),
    },
  };
}
