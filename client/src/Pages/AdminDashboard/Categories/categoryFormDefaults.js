export const CATEGORY_FORM_TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "images", label: "Image" },
  { id: "description", label: "Description" },
  { id: "seo", label: "SEO" },
];

export const defaultCategoryFields = {
  name: "",
  slug: "",
  parentId: "",
  status: "active",
  description: "",
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

export function categoryToForm(category) {
  if (!category) return { ...defaultCategoryFields };

  return {
    name: category.name || "",
    slug: category.slug || "",
    parentId: category.parentId || "",
    status: category.status || "active",
    description: category.description || "",
    seo: {
      metaTitle: category.seo?.metaTitle || "",
      metaDescription: category.seo?.metaDescription || "",
      keywords: category.seo?.keywords || "",
    },
  };
}

export function formToPayload(formFields, images) {
  return {
    name: formFields.name,
    slug: formFields.slug || slugify(formFields.name),
    parentId: formFields.parentId || undefined,
    status: formFields.status || "active",
    description: formFields.description || "",
    seo: formFields.seo || {},
    images: images || [],
  };
}
