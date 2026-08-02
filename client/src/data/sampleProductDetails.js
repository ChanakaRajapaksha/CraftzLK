const IMG = {
  wine: {
    base: "/images/product_images/wooden_wine_glass.png",
    zoom: "/images/product_images/wooden_wine_glass_zoom.png",
  },
  curry: {
    base: "/images/product_images/jack_fruit_curry.png",
    zoom: "/images/product_images/jack_fruit_curry_zomm.png",
  },
  tea: {
    base: "/images/product_images/tea_powder.png",
    zoom: "/images/product_images/tea_powder_zoom.png",
  },
};

const PRODUCT_TEMPLATES = {
  "wooden-wine-glasses": {
    name: "Handcrafted Wooden Wine Glasses (Set of 2)",
    images: [IMG.wine.base, IMG.wine.zoom],
    rating: 0,
    reviewCount: 0,
    countInStock: 24,
    shortDescription: {
      bullets: [
        "Hand-carved from sustainable Sri Lankan wood",
        "Food-safe natural finish with smooth edges",
        "Perfect for wine, juice, or festive serving",
        "Eco-friendly and reusable artisan design",
        "Lightweight yet durable for daily use",
        "Ideal gift for weddings and home décor",
      ],
      disclaimer:
        "Actual product colors may vary slightly from the images shown on our website/app.",
    },
    colors: [
      { id: "natural", label: "Natural Wood", image: IMG.wine.base },
      { id: "dark", label: "Dark Walnut", image: IMG.wine.zoom },
    ],
    trustBadges: [
      { id: "authentic", label: "100% Authentic" },
      { id: "delivery", label: "Island wide Delivery" },
      { id: "express", label: "Express Delivery: Colombo 1-12" },
    ],
    detailedDescription: [
      {
        title: "Handcrafted Artisan Quality",
        text: "Each wine glass is individually carved by skilled Sri Lankan artisans using sustainably sourced wood, giving every piece a unique grain pattern and warm natural character.",
      },
      {
        title: "Food-Safe Natural Finish",
        text: "Finished with a smooth, food-safe coating that protects the wood while preserving its organic look and feel — safe for wine, juice, and everyday beverages.",
      },
      {
        title: "Eco-Friendly & Reusable",
        text: "A beautiful alternative to disposable cups. These reusable glasses support eco-conscious living and reduce plastic waste in your home.",
      },
      {
        title: "Lightweight Yet Durable",
        text: "Designed for comfortable daily use with a balanced weight that feels premium in hand while remaining sturdy enough for regular serving.",
      },
      {
        title: "Perfect Gift Choice",
        text: "Elegantly packaged and ideal for weddings, housewarmings, and festive occasions — a thoughtful handmade gift from CraftzLK.",
      },
      {
        title: "Island-Wide Fresh Delivery",
        text: "Securely packed to prevent damage in transit. Most orders arrive within 2–4 days across Sri Lanka with careful handling from our workshop to your door.",
      },
    ],
  },
  "jack-fruit-curry": {
    name: "Traditional Jack Fruit Curry (Homemade)",
    images: [IMG.curry.base, IMG.curry.zoom],
    rating: 0,
    reviewCount: 0,
    countInStock: 18,
    shortDescription: {
      bullets: [
        "Slow-cooked with fresh jack fruit and spices",
        "No artificial preservatives or additives",
        "Authentic Sri Lankan homemade recipe",
        "Ready to heat and serve in minutes",
        "Vacuum-sealed for freshness",
        "Best enjoyed with rice or roti",
      ],
      disclaimer:
        "Actual product colors may vary slightly from the images shown on our website/app.",
    },
    colors: [{ id: "classic", label: "Classic Recipe", image: IMG.curry.base }],
    trustBadges: [
      { id: "authentic", label: "100% Authentic" },
      { id: "delivery", label: "Island wide Delivery" },
      { id: "express", label: "Express Delivery: Colombo 1-12" },
    ],
    detailedDescription: [
      {
        title: "Authentic Homemade Recipe",
        text: "Prepared using a traditional Sri Lankan jack fruit curry recipe passed down through generations, slow-cooked to bring out rich, natural flavour.",
      },
      {
        title: "Fresh Natural Ingredients",
        text: "Made with ripe jack fruit, aromatic spices, and coconut — with no artificial preservatives, colours, or additives.",
      },
      {
        title: "Ready in Minutes",
        text: "Vacuum-sealed and ready to heat. Simply warm and serve with rice, roti, or bread for a wholesome homemade meal any day of the week.",
      },
      {
        title: "Secure Hygienic Packaging",
        text: "Packed in food-grade containers with a tight seal to lock in freshness, aroma, and taste from our kitchen to yours.",
      },
      {
        title: "Supports Local Home Businesses",
        text: "Every purchase directly supports small home cooks and local artisans who craft each batch with care and tradition.",
      },
      {
        title: "Fast Island-Wide Delivery",
        text: "Shipped fresh with insulated packaging where needed. Most orders reach customers safely within 2–4 days across Sri Lanka.",
      },
    ],
  },
  "ranawara-tea-powder": {
    name: "Organic Ranawara Tea Powder (100g)",
    images: [IMG.tea.base, IMG.tea.zoom],
    rating: 0,
    reviewCount: 0,
    countInStock: 0,
    shortDescription: {
      bullets: [
        "Sun-dried Ranawara flowers from local farms",
        "100% natural herbal tea powder",
        "Supports wellness and relaxation",
        "No caffeine — suitable for any time of day",
        "Eco-friendly packaging",
        "Brew hot or enjoy as iced herbal tea",
      ],
      disclaimer:
        "Actual product colors may vary slightly from the images shown on our website/app.",
    },
    colors: [{ id: "natural", label: "Natural Gold", image: IMG.tea.base }],
    trustBadges: [
      { id: "authentic", label: "100% Authentic" },
      { id: "delivery", label: "Island wide Delivery" },
      { id: "express", label: "Express Delivery: Colombo 1-12" },
    ],
    detailedDescription: [
      {
        title: "100% Natural Herbal Tea",
        text: "Sun-dried Ranawara flowers are carefully ground into a fine powder with no caffeine, additives, or artificial flavouring — pure herbal goodness.",
      },
      {
        title: "Traditional Wellness Blend",
        text: "Ranawara has long been enjoyed in Sri Lankan households as a calming herbal drink, ideal for relaxation any time of day.",
      },
      {
        title: "Farm-Fresh Sourcing",
        text: "Flowers are sourced from trusted local farms and processed in small batches to preserve aroma, colour, and natural properties.",
      },
      {
        title: "Easy to Brew",
        text: "Stir into hot water for a soothing cup, or brew and chill for a refreshing iced herbal tea. A little goes a long way.",
      },
      {
        title: "Eco-Conscious Packaging",
        text: "Packaged in recyclable materials with clear labelling — part of CraftzLK's commitment to sustainable, eco-friendly products.",
      },
      {
        title: "Reliable Fresh Delivery",
        text: "Sealed for freshness and shipped island-wide. Store in a cool, dry place and enjoy the authentic taste of Sri Lankan herbal tea.",
      },
    ],
  },
};

/** Build a unique product id used in home rails and /product/:id routes */
export function getHomeRailProductId(section, page, cardIndex) {
  const typeMap = {
    featured: "wooden-wine-glasses",
    trending: "jack-fruit-curry",
    "new-arrivals": "ranawara-tea-powder",
    "best-sellers": "wooden-wine-glasses",
  };
  const type = typeMap[section] ?? "wooden-wine-glasses";
  return `${section}-${type}-p${page}-${cardIndex}`;
}

function parsePrice(str) {
  return Number(String(str).replace(/,/g, ""));
}

function formatPrice(amount) {
  return `Rs ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildCatalogEntry(id, templateKey, pricing) {
  const template = PRODUCT_TEMPLATES[templateKey];
  if (!template) return null;

  const price = pricing.price ?? parsePrice(pricing.nowPrice ?? pricing.priceLabel ?? "0");
  const oldPrice = pricing.oldPrice
    ? parsePrice(pricing.oldPrice)
    : pricing.wasPrice
      ? parsePrice(pricing.wasPrice)
      : null;

  return {
    id,
    ...template,
    price,
    oldPrice,
    priceDisplay: formatPrice(price),
    oldPriceDisplay: oldPrice ? formatPrice(oldPrice) : null,
    cashPriceLabel: "CASH PRICE",
    section: pricing.section,
  };
}

function generateCatalog() {
  const catalog = {};

  const featuredRows = [
    [
      { wasPrice: "27,000", nowPrice: "15,900" },
      { wasPrice: "27,000", nowPrice: "15,900" },
      { wasPrice: "27,000", nowPrice: "15,900" },
      { wasPrice: "27,000", nowPrice: "15,900" },
      { wasPrice: "27,000", nowPrice: "15,900" },
    ],
    [
      { wasPrice: "26,500", nowPrice: "16,500" },
      { wasPrice: "26,500", nowPrice: "16,500" },
      { wasPrice: "26,500", nowPrice: "16,500" },
      { wasPrice: "26,500", nowPrice: "16,500" },
      { wasPrice: "26,500", nowPrice: "16,500" },
    ],
  ];

  featuredRows.forEach((row, page) => {
    row.forEach((pricing, i) => {
      const id = getHomeRailProductId("featured", page, i);
      catalog[id] = buildCatalogEntry(id, "wooden-wine-glasses", {
        ...pricing,
        section: "featured",
      });
    });
  });

  const trendingRows = [
    [
      { wasPrice: "1,950", nowPrice: "1,450" },
      { wasPrice: "1,950", nowPrice: "1,450" },
      { wasPrice: "1,950", nowPrice: "1,450" },
      { wasPrice: "1,950", nowPrice: "1,450" },
      { wasPrice: "1,950", nowPrice: "1,450" },
    ],
    [
      { wasPrice: "2,100", nowPrice: "1,590" },
      { wasPrice: "2,100", nowPrice: "1,590" },
      { wasPrice: "2,100", nowPrice: "1,590" },
      { wasPrice: "2,100", nowPrice: "1,590" },
      { wasPrice: "2,100", nowPrice: "1,590" },
    ],
  ];

  trendingRows.forEach((row, page) => {
    row.forEach((pricing, i) => {
      const id = getHomeRailProductId("trending", page, i);
      catalog[id] = buildCatalogEntry(id, "jack-fruit-curry", {
        ...pricing,
        section: "trending",
      });
    });
  });

  const newArrivalRows = [
    [{ price: "1,450" }, { price: "1,450" }, { price: "1,450" }, { price: "1,450" }, { price: "1,450" }],
    [{ price: "1,450" }, { price: "1,450" }, { price: "1,450" }, { price: "1,450" }, { price: "1,450" }],
  ];

  newArrivalRows.forEach((row, page) => {
    row.forEach((pricing, i) => {
      const id = getHomeRailProductId("new-arrivals", page, i);
      const entry = buildCatalogEntry(id, "ranawara-tea-powder", {
        ...pricing,
        section: "new-arrivals",
      });
      if (page === 1 && i === 2) {
        entry.countInStock = 12;
      }
      catalog[id] = entry;
    });
  });

  const bestSellerRows = featuredRows;
  bestSellerRows.forEach((row, page) => {
    row.forEach((pricing, i) => {
      const id = getHomeRailProductId("best-sellers", page, i);
      catalog[id] = buildCatalogEntry(id, "wooden-wine-glasses", {
        ...pricing,
        section: "best-sellers",
      });
    });
  });

  return catalog;
}

export const SAMPLE_PRODUCT_CATALOG = generateCatalog();

export function getSampleProductById(id) {
  return SAMPLE_PRODUCT_CATALOG[id] ?? null;
}

export function isSampleProductId(id) {
  return Boolean(getSampleProductById(id));
}

const ALSO_LIKE_PICKS = [
  ["featured", 0, 0],
  ["trending", 0, 1],
  ["new-arrivals", 0, 2],
  ["best-sellers", 0, 3],
  ["featured", 1, 4],
  ["trending", 1, 0],
  ["new-arrivals", 1, 1],
];

/** Up to five related sample products for the product details page (excludes current). */
export function getYouMayAlsoLikeProducts(currentId, count = 5) {
  const picks = [];

  for (const [section, page, index] of ALSO_LIKE_PICKS) {
    const id = getHomeRailProductId(section, page, index);
    if (id === currentId) continue;

    const product = getSampleProductById(id);
    if (product && !picks.some((item) => item.id === product.id)) {
      picks.push(product);
    }

    if (picks.length >= count) break;
  }

  if (picks.length < count) {
    for (const product of Object.values(SAMPLE_PRODUCT_CATALOG)) {
      if (product.id === currentId || picks.some((item) => item.id === product.id)) continue;
      picks.push(product);
      if (picks.length >= count) break;
    }
  }

  return picks.slice(0, count);
}
