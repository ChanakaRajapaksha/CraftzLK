export const ARTISAN_LIST_SAMPLE = [
  {
    _id: "artisan-demo-nimal",
    name: "Nimal Handcraft Studio",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"],
    bio: "Traditional wooden crafts maker from Kandy.",
    location: "Kandy, Sri Lanka",
    story: "Nimal Handcraft Studio has been creating traditional wooden crafts for over 20 years, preserving Sri Lankan heritage through hand-carved bowls, utensils, and decorative pieces.",
    status: "active",
    productCount: 14,
    social: {
      website: "https://nimalhandcraft.example",
      instagram: "https://instagram.com/nimalhandcraft",
    },
  },
  {
    _id: "artisan-demo-lakshmi",
    name: "Lakshmi Batik House",
    images: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"],
    bio: "Hand-painted batik textiles and wall art.",
    location: "Galle, Sri Lanka",
    story: "Founded by Lakshmi Fernando, this studio blends traditional batik techniques with contemporary patterns for home décor and fashion accessories.",
    status: "active",
    productCount: 9,
    social: {
      facebook: "https://facebook.com/lakshmibatik",
      instagram: "https://instagram.com/lakshmibatik",
    },
  },
  {
    _id: "artisan-demo-raj",
    name: "Raj Pottery Works",
    images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"],
    bio: "Clay pottery and ceramic homeware.",
    location: "Matara, Sri Lanka",
    story: "Raj Pottery Works crafts functional and decorative ceramics using locally sourced clay and traditional wheel-throwing methods.",
    status: "active",
    productCount: 11,
    social: {
      website: "https://rajpottery.example",
    },
  },
  {
    _id: "artisan-demo-amara",
    name: "Amara Lace Studio",
    images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"],
    bio: "Handmade lace, embroidery, and textile gifts.",
    location: "Negombo, Sri Lanka",
    story: "Amara Lace Studio specializes in delicate handmade lace products, from table runners to gift wraps, made by skilled local artisans.",
    status: "active",
    productCount: 7,
    social: {
      instagram: "https://instagram.com/amaralace",
    },
  },
  {
    _id: "artisan-demo-sunil",
    name: "Sunil Cane Crafts",
    images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"],
    bio: "Eco-friendly cane and rattan furniture.",
    location: "Colombo, Sri Lanka",
    story: "Sunil Cane Crafts produces sustainable cane baskets, chairs, and storage solutions using responsibly harvested materials.",
    status: "inactive",
    productCount: 5,
    social: {
      facebook: "https://facebook.com/sunilcane",
    },
  },
  {
    _id: "artisan-demo-priya",
    name: "Priya Jewelry Atelier",
    images: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"],
    bio: "Handmade silver and gemstone jewelry.",
    location: "Colombo, Sri Lanka",
    story: "Priya Jewelry Atelier designs one-of-a-kind pieces inspired by Sri Lankan motifs, combining silverwork with natural gemstones.",
    status: "active",
    productCount: 18,
    social: {
      website: "https://priyajewelry.example",
      instagram: "https://instagram.com/priyajewelry",
    },
  },
  {
    _id: "artisan-demo-kamal",
    name: "Kamal Leather Works",
    images: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop"],
    bio: "Hand-stitched leather bags and accessories.",
    location: "Kurunegala, Sri Lanka",
    story: "Kamal Leather Works creates durable handmade bags and wallets using vegetable-tanned leather and traditional stitching techniques.",
    status: "active",
    productCount: 12,
    social: {
      instagram: "https://instagram.com/kamalleather",
    },
  },
  {
    _id: "artisan-demo-dilani",
    name: "Dilani Candle Co.",
    images: ["https://images.unsplash.com/photo-1544725176-7c40e711a817?w=200&h=200&fit=crop"],
    bio: "Soy candles and natural home fragrances.",
    location: "Nuwara Eliya, Sri Lanka",
    story: "Dilani Candle Co. hand-pours small-batch soy candles with essential oils inspired by Sri Lankan spices and botanicals.",
    status: "active",
    productCount: 8,
    social: {
      website: "https://dilanicandles.example",
      facebook: "https://facebook.com/dilanicandles",
    },
  },
  {
    _id: "artisan-demo-anil",
    name: "Anil Mask Gallery",
    images: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"],
    bio: "Traditional Sri Lankan mask carving.",
    location: "Ambalangoda, Sri Lanka",
    story: "Anil Mask Gallery preserves the ancient art of Sri Lankan mask making, crafting ceremonial and decorative masks by hand.",
    status: "active",
    productCount: 6,
    social: {
      facebook: "https://facebook.com/anilmaskgallery",
    },
  },
  {
    _id: "artisan-demo-maya",
    name: "Maya Weaving Collective",
    images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop"],
    bio: "Handloom textiles and woven home goods.",
    location: "Jaffna, Sri Lanka",
    story: "Maya Weaving Collective supports a group of women weavers producing handloom scarves, table linens, and cushion covers.",
    status: "inactive",
    productCount: 4,
    social: {
      instagram: "https://instagram.com/mayaweaving",
    },
  },
];

export function getArtisanListSampleData() {
  return ARTISAN_LIST_SAMPLE.map((item) => ({ ...item }));
}

export function isSampleArtisanId(id) {
  return String(id || "").startsWith("artisan-demo-");
}
