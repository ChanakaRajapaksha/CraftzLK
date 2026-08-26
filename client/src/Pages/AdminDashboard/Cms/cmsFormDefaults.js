export const CMS_FORM_TABS = [
  { id: "title", label: "Title" },
  { id: "content", label: "Content" },
  { id: "images", label: "Images" },
  { id: "seo", label: "SEO" },
];

export const CMS_COMING_SOON_HINT =
  "Leave content empty to show a Coming Soon message on the storefront until you publish real content.";

export const SYSTEM_CMS_SLUGS = new Set(["home", "shop", "categories", "gifts", "eco"]);

/** Slugs reserved for built-in storefront routes (not available for new custom pages). */
export const CMS_RESERVED_SLUGS = new Set([
  "home",
  "shop",
  "categories",
  "collections",
  "products",
  "product",
  "cart",
  "signin",
  "signup",
  "gifts",
  "eco",
  "orders",
  "checkout",
  "search",
  "dashboard",
]);

export const defaultCmsPageFields = {
  title: "",
  slug: "",
  content: "",
  status: "active",
  showInNav: true,
  pageType: "custom",
  routePath: "",
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
    showInNav: page.showInNav !== false,
    pageType: page.pageType || "custom",
    routePath: page.routePath || page.path || "",
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
    showInNav: formFields.showInNav !== false,
    seo: formFields.seo || {},
  };
}

export function getPagePath(slugOrPage) {
  if (slugOrPage && typeof slugOrPage === "object") {
    return slugOrPage.path || slugOrPage.routePath || getPagePath(slugOrPage.slug);
  }

  const slug = slugOrPage;
  if (!slug) return "—";
  if (slug === "home") return "/";
  if (slug === "shop") return "/collections/all";
  if (slug === "categories") return "Header menu";
  return `/${slug}`;
}

export function slugFromPathname(pathname = "") {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (path === "/collections/all") return "shop";
  if (path.startsWith("/") && path.split("/").filter(Boolean).length === 1) {
    return path.slice(1);
  }
  return "";
}

/** App routes that are not CMS content pages. */
export const CMS_RESERVED_ROOT_PATHS = new Set([
  "collections",
  "products",
  "product",
  "cart",
  "signIn",
  "signUp",
  "forgot-password",
  "reset-password",
  "my-list",
  "compare",
  "checkout",
  "thank-you",
  "orders",
  "gifts",
  "eco",
  "home",
  "shop",
  "categories",
  "my-account",
  "search",
  "verifyOTP",
  "changePassword",
  "dashboard",
  "page",
]);

export function isReservedCmsSlug(slug) {
  return CMS_RESERVED_SLUGS.has(String(slug || "").toLowerCase());
}

export function isSystemCmsPage(page) {
  return page?.pageType === "system" || page?.isSystem === true || SYSTEM_CMS_SLUGS.has(page?.slug);
}
