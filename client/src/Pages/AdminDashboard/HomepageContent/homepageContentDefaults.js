export const HOMEPAGE_SECTIONS = [
  {
    key: "featuredProducts",
    label: "Featured Products",
    description: "Hand-picked products shown in the homepage featured rail.",
    path: "featured",
    mode: "manual",
    modeLabel: "Manual selection",
  },
  {
    key: "trendingProducts",
    label: "Trending Products",
    description: "Products highlighted in the trending now section.",
    path: "trending",
    mode: "manual",
    modeLabel: "Manual selection",
  },
  {
    key: "newArrivals",
    label: "New Arrivals",
    description: "Latest products — automatic or manually curated.",
    path: "new-arrivals",
    mode: "auto-manual",
    modeLabel: "Auto / Manual",
  },
  {
    key: "bestSellers",
    label: "Best Sellers",
    description: "Top products ranked by order volume and sales.",
    path: "best-sellers",
    mode: "auto",
    modeLabel: "Auto (sales)",
  },
  {
    key: "popularCategories",
    label: "Popular Categories",
    description: "Category tiles with custom images and display order.",
    path: "popular-categories",
    mode: "manual",
    modeLabel: "Manual curation",
  },
];

export const defaultHomepageContent = {
  featuredProducts: {
    enabled: true,
    productIds: [],
    productNames: [],
  },
  trendingProducts: {
    enabled: true,
    productIds: [],
    productNames: [],
  },
  newArrivals: {
    enabled: true,
    mode: "auto",
    productIds: [],
    productNames: [],
    autoLimit: 10,
  },
  bestSellers: {
    enabled: true,
    autoLimit: 10,
  },
  popularCategories: {
    enabled: true,
    items: [],
  },
};

export function getSampleHomepageContent() {
  return {
    ...defaultHomepageContent,
    featuredProducts: {
      enabled: true,
      productIds: ["sample-p1", "sample-p2", "sample-p3"],
      productNames: ["Kandyan Silk Saree", "Handloom Cotton Saree", "Matte Ceramic Vase Set"],
    },
    trendingProducts: {
      enabled: true,
      productIds: ["sample-p4", "sample-p5"],
      productNames: ["Wooden Wine Glasses", "Ranawara Tea Powder"],
    },
    newArrivals: {
      enabled: true,
      mode: "auto",
      productIds: [],
      productNames: [],
      autoLimit: 10,
    },
    bestSellers: {
      enabled: true,
      autoLimit: 10,
    },
    popularCategories: {
      enabled: true,
      items: [
        {
          categoryId: "sample-c1",
          categoryName: "Home & Living",
          image: "/images/categories_images/category-1.webp",
          displayOrder: 1,
        },
        {
          categoryId: "sample-c2",
          categoryName: "Fashion & Accessories",
          image: "/images/categories_images/category-2.webp",
          displayOrder: 2,
        },
        {
          categoryId: "sample-c3",
          categoryName: "Kids & Baby",
          image: "/images/categories_images/category-3.webp",
          displayOrder: 3,
        },
        {
          categoryId: "sample-c4",
          categoryName: "Art & Collectibles",
          image: "/images/categories_images/category-4.webp",
          displayOrder: 4,
        },
      ],
    },
  };
}

export function getSectionSummary(sectionKey, content) {
  const section = content?.[sectionKey];
  if (!section) return { count: 0, detail: "—" };

  if (sectionKey === "popularCategories") {
    const count = section.items?.length || 0;
    return { count, detail: `${count} categories` };
  }

  if (sectionKey === "bestSellers") {
    return {
      count: section.autoLimit || 10,
      detail: `Top ${section.autoLimit || 10} by sales`,
    };
  }

  if (sectionKey === "newArrivals") {
    const mode = section.mode === "manual" ? "Manual" : "Automatic";
    const count =
      section.mode === "manual"
        ? section.productIds?.length || 0
        : section.autoLimit || 10;
    return { count, detail: mode };
  }

  return {
    count: section.productIds?.length || 0,
    detail: `${section.productIds?.length || 0} products`,
  };
}

export function moveItem(list, index, direction) {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
