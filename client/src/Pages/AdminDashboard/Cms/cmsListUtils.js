const SAMPLE_PAGES = [
  {
    _id: "sample-cms-about",
    id: "sample-cms-about",
    title: "About Us",
    slug: "about",
    content:
      "CraftzLK is a Sri Lankan marketplace for authentic handmade, eco-friendly, and premium homestyle products.",
    images: [],
    status: "active",
    seo: {
      metaTitle: "About Us | CraftzLK",
      metaDescription: "Learn about CraftzLK.",
      keywords: "about, craftzlk",
    },
    dateUpdated: "2026-06-01T10:00:00.000Z",
  },
  {
    _id: "sample-cms-contact",
    id: "sample-cms-contact",
    title: "Contact",
    slug: "contact",
    content: "Reach us via WhatsApp at 0715264449 or email hello@craftzlk.com.",
    images: [],
    status: "active",
    seo: {
      metaTitle: "Contact | CraftzLK",
      metaDescription: "Contact CraftzLK support.",
      keywords: "contact, support",
    },
    dateUpdated: "2026-06-02T11:00:00.000Z",
  },
  {
    _id: "sample-cms-privacy",
    id: "sample-cms-privacy",
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: "This Privacy Policy explains how CraftzLK collects and uses your personal information.",
    images: [],
    status: "active",
    seo: {
      metaTitle: "Privacy Policy | CraftzLK",
      metaDescription: "CraftzLK privacy policy.",
      keywords: "privacy, policy",
    },
    dateUpdated: "2026-06-03T09:00:00.000Z",
  },
  {
    _id: "sample-cms-terms",
    id: "sample-cms-terms",
    title: "Terms & Conditions",
    slug: "terms",
    content: "These Terms & Conditions govern your use of the CraftzLK website and services.",
    images: [],
    status: "active",
    seo: {
      metaTitle: "Terms & Conditions | CraftzLK",
      metaDescription: "CraftzLK terms and conditions.",
      keywords: "terms, conditions",
    },
    dateUpdated: "2026-06-04T14:00:00.000Z",
  },
];

export function getCmsPageSampleData() {
  return SAMPLE_PAGES.map((item) => ({ ...item }));
}

export function isSampleCmsPageId(id) {
  return String(id || "").startsWith("sample-cms-");
}
