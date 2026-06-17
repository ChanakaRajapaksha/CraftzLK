export const PRODUCT_FORM_TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "images", label: "Images" },
  { id: "category", label: "Category" },
  { id: "pricing", label: "Pricing" },
  { id: "inventory", label: "Inventory" },
  { id: "variants", label: "Variants" },
  { id: "customization", label: "Customization" },
  { id: "shipping", label: "Shipping" },
  { id: "seo", label: "SEO" },
];

export const defaultProductFields = {
  name: "",
  sku: "",
  slug: "",
  shortDescription: "",
  description: "",
  brand: "",
  price: "",
  oldPrice: "",
  discountPrice: "",
  discountType: "percentage",
  catId: "",
  catName: "",
  subCatId: "",
  subCatName: "",
  subCat: "",
  category: "",
  countInStock: "",
  stockStatus: "in_stock",
  minStockAlert: "5",
  status: "active",
  rating: "4",
  isFeatured: false,
  discount: "",
  productRam: "",
  size: "",
  productWeight: "",
  location: "All",
  variants: [],
  customizationOptions: [],
  shipping: {
    weight: "",
    length: "",
    width: "",
    height: "",
    freeShipping: false,
    shippingCharge: "",
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
};

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function productToForm(product) {
  if (!product) return { ...defaultProductFields };

  const firstRam = Array.isArray(product.productRam) ? product.productRam[0] : product.productRam;
  const firstSize = Array.isArray(product.size) ? product.size[0] : product.size;
  const firstWeight = Array.isArray(product.productWeight) ? product.productWeight[0] : product.productWeight;

  return {
    name: product.name || "",
    sku: product.sku || "",
    slug: product.slug || "",
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    brand: product.brand || "",
    price: product.price ?? "",
    oldPrice: product.oldPrice ?? "",
    discountPrice: product.discountPrice ?? "",
    discountType: product.discountType || "percentage",
    catId: product.catId || "",
    catName: product.catName || "",
    subCatId: product.subCatId || "",
    subCatName: product.subCatName || "",
    subCat: product.subCat || "",
    category: product.category?._id || product.category || "",
    countInStock: product.countInStock ?? "",
    stockStatus: product.stockStatus || "in_stock",
    minStockAlert: product.minStockAlert ?? "5",
    status: product.status || "active",
    rating: product.rating ?? "4",
    isFeatured: Boolean(product.isFeatured),
    discount: product.discount ?? "",
    productRam: firstRam || "",
    size: firstSize || "",
    productWeight: firstWeight || "",
    location: product.location || "All",
    variants: product.variants || [],
    customizationOptions: product.customizationOptions || [],
    shipping: {
      weight: product.shipping?.weight ?? "",
      length: product.shipping?.length ?? "",
      width: product.shipping?.width ?? "",
      height: product.shipping?.height ?? "",
      freeShipping: Boolean(product.shipping?.freeShipping),
      shippingCharge: product.shipping?.shippingCharge ?? "",
    },
    seo: {
      metaTitle: product.seo?.metaTitle || "",
      metaDescription: product.seo?.metaDescription || "",
      keywords: product.seo?.keywords || "",
    },
  };
}

export function formToPayload(formFields) {
  return {
    ...formFields,
    price: Number(formFields.price) || 0,
    oldPrice: Number(formFields.oldPrice || formFields.price) || 0,
    discountPrice: Number(formFields.discountPrice) || 0,
    countInStock: Number(formFields.countInStock) || 0,
    minStockAlert: Number(formFields.minStockAlert) || 5,
    rating: Number(formFields.rating) || 4,
    discount: Number(formFields.discount) || 0,
    shipping: {
      weight: Number(formFields.shipping?.weight) || 0,
      length: Number(formFields.shipping?.length) || 0,
      width: Number(formFields.shipping?.width) || 0,
      height: Number(formFields.shipping?.height) || 0,
      freeShipping: Boolean(formFields.shipping?.freeShipping),
      shippingCharge: Number(formFields.shipping?.shippingCharge) || 0,
    },
    seo: formFields.seo || {},
    variants: (formFields.variants || []).map((group) => ({
      ...group,
      options: (group.options || []).map((opt) => ({
        ...opt,
        price: Number(opt.price) || 0,
        stock: Number(opt.stock) || 0,
      })),
    })),
    customizationOptions: formFields.customizationOptions || [],
  };
}
