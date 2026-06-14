import InfoSampleLayout from "../InfoSample/InfoSampleLayout";
import { COLLECTIONS_ALL_PATH } from "../Collections/collectionsConstants";

const Eco = () => (
  <InfoSampleLayout
    breadcrumbLabel="Eco"
    eyebrow="Planet-first craft"
    eyebrowIcon={
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22c-4-3-8-8-8-14a8 8 0 0 1 16 0c0 6-4 11-8 14Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    }
    title="Eco-friendly by design"
    lead="CraftzLK celebrates sustainable craftsmanship — natural materials, low-waste packaging, and support for local makers who create with respect for people and planet."
    stats={[
      { value: "100%", label: "Natural materials" },
      { value: "Zero", label: "Plastic filler" },
      { value: "Local", label: "Artisan network" },
    ]}
    cards={[
      {
        icon: "leaf",
        title: "Sustainable sourcing",
        text: "Wood, clay, cotton, and natural fibres sourced responsibly from Sri Lankan suppliers and small farms.",
      },
      {
        icon: "recycle",
        title: "Reusable packaging",
        text: "Recyclable boxes, paper wrap, and jute bags instead of plastic — designed to be kept or composted.",
      },
      {
        icon: "seed",
        title: "Natural ingredients",
        text: "Homemade spices, pickles, and sweets made without artificial preservatives or unnecessary additives.",
      },
      {
        icon: "truck",
        title: "Conscious delivery",
        text: "Consolidated island-wide routes and minimal packaging to reduce waste on every order we ship.",
      },
    ]}
    quote="We believe beautiful products shouldn't cost the earth. Every purchase helps keep traditional, low-impact crafts alive."
    sections={[
      {
        title: "Our eco commitment",
        paragraphs: [
          "From the workshop to your doorstep, we choose materials and processes that minimise environmental impact. Our makers work in small batches, reducing overproduction and waste.",
          "We partner with home businesses and village artisans across Sri Lanka — shortening supply chains, supporting rural livelihoods, and celebrating crafts that have been passed down for generations.",
        ],
      },
    ]}
    highlights={[
      "Biodegradable and recyclable packaging on all orders",
      "Handmade products built to last, not disposable",
      "No mass-produced imports — authentic local craft only",
      "Transparent sourcing from verified artisan partners",
    ]}
    primaryCta={{ label: "Shop eco-friendly picks", to: "/collections/food-and-homemade" }}
    secondaryCta={{ label: "Explore all collections", to: COLLECTIONS_ALL_PATH }}
    contact={{
      text: "Questions about our sustainability practices? Reach us at",
      email: "hello@craftzlk.com",
    }}
  />
);

export default Eco;
