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
  shortDescription: {
    bullets: [""],
    disclaimer: "",
  },
  description: {
    points: [{ title: "", text: "" }],
  },
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

export function parseShortDescriptionBullets(value) {
  if (!value) return [""];
  if (typeof value === "object" && Array.isArray(value.bullets)) {
    const bullets = value.bullets.map((line) => String(line || "").trim()).filter(Boolean);
    return bullets.length ? bullets : [""];
  }
  if (typeof value === "string") {
    const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
    return lines.length ? lines : [""];
  }
  return [""];
}

export function parseDescriptionPoints(value) {
  const emptyPoint = { title: "", text: "" };

  if (!value) return [emptyPoint];

  if (Array.isArray(value)) {
    const points = value
      .map((point) => ({
        title: String(point?.title || "").trim(),
        text: String(point?.text || "").trim(),
      }))
      .filter((point) => point.title || point.text);
    return points.length ? points : [emptyPoint];
  }

  if (typeof value === "object" && Array.isArray(value.points)) {
    const points = value.points
      .map((point) => ({
        title: String(point?.title || "").trim(),
        text: String(point?.text || "").trim(),
      }))
      .filter((point) => point.title || point.text);
    return points.length ? points : [emptyPoint];
  }

  if (typeof value === "string" && value.trim()) {
    return [{ title: "", text: value.trim() }];
  }

  return [emptyPoint];
}

export function parseProductLocation(value) {
  if (!value) return "All";
  if (typeof value === "string") return value || "All";
  if (Array.isArray(value)) {
    if (!value.length) return "All";
    if (value.length === 1) {
      const item = value[0];
      if (typeof item === "object") return item.label || item.value || "All";
      return String(item);
    }
    return value
      .map((item) => (typeof item === "object" ? item.label || item.value : String(item)))
      .filter(Boolean)
      .join(", ");
  }
  return "All";
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
    shortDescription: {
      bullets: parseShortDescriptionBullets(product.shortDescription),
      disclaimer:
        typeof product.shortDescription === "object" && product.shortDescription?.disclaimer
          ? product.shortDescription.disclaimer
          : "",
    },
    description: {
      points: parseDescriptionPoints(product.description),
    },
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
    location: parseProductLocation(product.location),
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
  const bullets = (formFields.shortDescription?.bullets || [])
    .map((line) => String(line || "").trim())
    .filter(Boolean);

  const descriptionPoints = (formFields.description?.points || [])
    .map((point) => ({
      title: String(point?.title || "").trim(),
      text: String(point?.text || "").trim(),
    }))
    .filter((point) => point.title || point.text);

  return {
    ...formFields,
    shortDescription: {
      bullets,
      disclaimer: formFields.shortDescription?.disclaimer?.trim() || "",
    },
    description: { points: descriptionPoints },
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
    location: formFields.location && formFields.location !== "All"
      ? [{ value: String(formFields.location), label: String(formFields.location) }]
      : [{ value: "All", label: "All" }],
  };
}

export function validateProductForm(formFields, previews = []) {
  const errors = {};

  if (!formFields.name?.trim()) {
    errors.name = "Product name is required.";
  }

  const shortBullets = (formFields.shortDescription?.bullets || [])
    .map((line) => String(line || "").trim())
    .filter(Boolean);
  if (!shortBullets.length) {
    errors.shortDescription = "Add at least one short description point.";
  }

  const descriptionPoints = (formFields.description?.points || []).filter(
    (point) => point.title?.trim() && point.text?.trim()
  );
  if (!descriptionPoints.length) {
    errors.description = "Add at least one full description point with a title and text.";
  }

  if (!previews.length) {
    errors.images = "At least one product image is required.";
  }

  if (!formFields.catId) {
    errors.catId = "Main category is required.";
  }

  const price = Number(formFields.price);
  if (
    formFields.price === "" ||
    formFields.price === null ||
    formFields.price === undefined ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    errors.price = "Regular price is required.";
  }

  const stock = Number(formFields.countInStock);
  if (
    formFields.countInStock === "" ||
    formFields.countInStock === null ||
    formFields.countInStock === undefined ||
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    errors.countInStock = "Stock quantity is required.";
  }

  const firstErrorKey = Object.keys(errors)[0];
  const tabByField = {
    name: "basic",
    shortDescription: "basic",
    description: "basic",
    images: "images",
    catId: "category",
    price: "pricing",
    countInStock: "inventory",
  };

  return {
    valid: !firstErrorKey,
    errors,
    message: firstErrorKey ? errors[firstErrorKey] : "",
    tab: firstErrorKey ? tabByField[firstErrorKey] || "basic" : "basic",
  };
}
