import InfoSampleLayout from "../InfoSample/InfoSampleLayout";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";

const About = () => (
  <InfoSampleLayout
    breadcrumbLabel="About"
    eyebrow="Our story"
    eyebrowIcon={
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    }
    title="About CraftzLK"
    lead="We are a Sri Lankan marketplace for authentic handmade, eco-friendly, and premium homestyle products — connecting skilled artisans with customers who value quality, tradition, and care."
    stats={[
      { value: "500+", label: "Artisan partners" },
      { value: "Island-wide", label: "Delivery" },
      { value: "2020", label: "Founded" },
    ]}
    cards={[
      {
        icon: "heart",
        title: "Our mission",
        text: "To preserve Sri Lankan craft traditions while giving makers a fair platform to reach customers across the island.",
      },
      {
        icon: "users",
        title: "Meet the makers",
        text: "Home kitchens, village workshops, and small studios — every product carries the story of the hands that made it.",
      },
      {
        icon: "star",
        title: "Quality promise",
        text: "We curate every listing for authenticity, freshness, and craftsmanship — so you shop with confidence.",
      },
      {
        icon: "home",
        title: "Community impact",
        text: "Your purchase supports rural families, women-led businesses, and the next generation of Sri Lankan artisans.",
      },
    ]}
    quote="CraftzLK started with a simple idea: make it easy for anyone in Sri Lanka to discover and buy genuinely handmade products — and to know exactly who made them."
    sections={[
      {
        title: "Who we are",
        paragraphs: [
          "CraftzLK was founded in 2020 with a passion for Sri Lanka's rich heritage of handmade goods — from wooden homeware and woven textiles to traditional sweets, spices, and pickles prepared in family kitchens.",
          "Today we work with hundreds of makers across the island, offering a curated online shop where every item is handcrafted, eco-conscious, and delivered with the warmth of a local marketplace.",
          "Whether you're looking for a thoughtful gift, ingredients for an authentic Sri Lankan meal, or a unique piece for your home, CraftzLK brings the best of local craft to your doorstep.",
        ],
      },
    ]}
    highlights={[
      "Authentic handmade products from verified artisans",
      "Secure island-wide delivery with careful packaging",
      "Friendly customer support via WhatsApp and email",
      "Committed to sustainability and fair maker partnerships",
    ]}
    primaryCta={{ label: "Explore the shop", to: COLLECTIONS_ALL_PATH }}
    secondaryCta={{ label: "View my orders", to: "/orders" }}
    contact={{
      text: "We'd love to hear from you — WhatsApp",
      phone: "94715264449",
      phoneDisplay: "0715264449",
      email: "hello@craftzlk.com",
    }}
  />
);

export default About;
