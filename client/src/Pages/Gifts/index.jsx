import InfoSampleLayout from "../InfoSample/InfoSampleLayout";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";

const Gifts = () => (
  <InfoSampleLayout
    breadcrumbLabel="Gifts"
    eyebrow="Thoughtful giving"
    eyebrowIcon={
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 8V21M3 12h18" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    }
    title="Gifts with heart & craft"
    lead="Discover curated handmade pieces, festive hampers, and gift-ready packaging — perfect for birthdays, weddings, housewarmings, and every celebration worth remembering."
    stats={[
      { value: "200+", label: "Gift-ready items" },
      { value: "Island-wide", label: "Delivery" },
      { value: "Free", label: "Artisan gift note" },
    ]}
    cards={[
      {
        icon: "gift",
        title: "Occasion hampers",
        text: "Beautifully arranged boxes of sweets, spices, homeware, and keepsakes — ready to delight on arrival.",
      },
      {
        icon: "box",
        title: "Corporate gifting",
        text: "Thoughtful branded hampers for clients and teams, crafted by local makers with premium presentation.",
      },
      {
        icon: "note",
        title: "Personalised notes",
        text: "Add a handwritten artisan card with your message — we include it with every gift order at no extra cost.",
      },
      {
        icon: "rings",
        title: "Wedding & events",
        text: "Custom favour boxes, table décor, and bulk orders for weddings, avurudu, and festive gatherings.",
      },
    ]}
    quote="Every CraftzLK gift supports a Sri Lankan artisan — handmade with care, wrapped with love, and delivered fresh to your door."
    sections={[
      {
        title: "How gifting works",
        paragraphs: [
          "Browse our collections and add items to your cart as usual. At checkout, tell us it's a gift in the order notes — we'll use eco-friendly packaging and include your personalised message.",
          "Need a ready-made hamper or bulk order for an event? Message us on WhatsApp with your budget and occasion. Our team will curate a selection and share photos before you confirm.",
        ],
      },
    ]}
    highlights={[
      "Gift wrapping available on all eligible products",
      "Island-wide delivery in 2–4 business days",
      "Fresh food items packed for safe transit",
      "WhatsApp support for custom hamper requests",
    ]}
    primaryCta={{ label: "Browse gift ideas", to: COLLECTIONS_ALL_PATH }}
    secondaryCta={{ label: "Shop handmade crafts", to: "/collections/handmade-crafts" }}
    contact={{
      text: "Planning a special order? Chat with us on WhatsApp:",
      phone: "94715264449",
      phoneDisplay: "0715264449",
    }}
  />
);

export default Gifts;
