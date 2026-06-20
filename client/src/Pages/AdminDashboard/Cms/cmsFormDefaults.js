export const CMS_FORM_TABS = [
  { id: "title", label: "Title" },
  { id: "content", label: "Content" },
  { id: "images", label: "Images" },
  { id: "seo", label: "SEO" },
];

export const defaultCmsPageFields = {
  title: "",
  slug: "",
  content: "",
  status: "active",
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

export function pageToForm(page) {
  if (!page) return { ...defaultCmsPageFields };

  return {
    title: page.title || "",
    slug: page.slug || "",
    content: page.content || "",
    status: page.status || "active",
    seo: {
      metaTitle: page.seo?.metaTitle || "",
      metaDescription: page.seo?.metaDescription || "",
      keywords: page.seo?.keywords || "",
    },
  };
}

export function formToPayload(formFields, images = []) {
  return {
    title: formFields.title,
    slug: formFields.slug || slugify(formFields.title),
    content: formFields.content || "",
    images,
    status: formFields.status || "active",
    seo: formFields.seo || {},
  };
}

export function getPagePath(slug) {
  if (!slug) return "—";
  if (slug === "about") return "/about";
  if (slug === "contact") return "/contact";
  return `/${slug}`;
}
