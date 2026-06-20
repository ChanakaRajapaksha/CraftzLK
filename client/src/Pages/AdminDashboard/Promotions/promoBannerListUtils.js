const SAMPLE_BANNERS = [
  {
    _id: "sample-banner-1",
    id: "sample-banner-1",
    heading: "New Handmade Collection",
    title: "New Handmade Collection",
    description: "Discover fresh artisan pieces crafted across Sri Lanka.",
    buttonText: "Shop Now",
    buttonUrl: "/collections",
    link: "/collections",
    desktopImage: "https://images.unsplash.com/photo-1615529182904-1481486c7840?w=1200&h=500&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1615529182904-1481486c7840?w=600&h=800&fit=crop",
    displayOrder: 1,
    status: "active",
  },
  {
    _id: "sample-banner-2",
    id: "sample-banner-2",
    heading: "Support Local Artisans",
    title: "Support Local Artisans",
    description: "Every purchase empowers a maker in your community.",
    buttonText: "Explore Makers",
    buttonUrl: "/artisans",
    link: "/artisans",
    desktopImage: "https://images.unsplash.com/photo-1452860606245-08befbf0d145?w=1200&h=500&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1452860606245-08befbf0d145?w=600&h=800&fit=crop",
    displayOrder: 2,
    status: "active",
  },
  {
    _id: "sample-banner-3",
    id: "sample-banner-3",
    heading: "Festive Gift Edit",
    title: "Festive Gift Edit",
    description: "Curated handmade gifts for every celebration.",
    buttonText: "Browse Gifts",
    buttonUrl: "/gifts",
    link: "/gifts",
    desktopImage: "https://images.unsplash.com/photo-1513885535751-8b1fbf850a40?w=1200&h=500&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1513885535751-8b1fbf850a40?w=600&h=800&fit=crop",
    displayOrder: 3,
    status: "inactive",
  },
];

export function getPromoBannerListSampleData() {
  return SAMPLE_BANNERS.map((item) => ({ ...item }));
}

export function isSamplePromoBannerId(id) {
  return String(id || "").startsWith("sample-banner-");
}
