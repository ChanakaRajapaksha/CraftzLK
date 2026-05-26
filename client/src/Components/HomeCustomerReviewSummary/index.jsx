import { useState } from "react";
import {
  HiHandThumbUp,
  HiOutlineHeart,
  HiOutlineShieldCheck,
  HiOutlineTag,
  HiOutlineTruck,
  HiSparkles,
} from "react-icons/hi2";
import CustomerReviewsModal from "../CustomerReviewsModal";
import { REVIEW_AVERAGE, REVIEW_TOTAL_LABEL } from "../CustomerReviewsModal/reviewStats";
import "./HomeCustomerReviewSummary.css";

const BRAND = "CraftzLK";

const TAGS = [
  "Handmade Quality",
  "Freshness",
  "Eco-Friendly Materials",
  "Packaging",
  "Delivery",
  "Authenticity",
  "Taste & Aroma",
];

const SUMMARY_PARAGRAPHS = [
  `${BRAND} is loved for its authentic handmade, eco-friendly, and premium homemade products crafted with care using natural ingredients. Customers appreciate the freshness, traditional taste, and sustainable approach that supports local artisans and small home businesses. Every product reflects genuine craftsmanship and homely quality, making it feel special and personal.`,
  "Packaging is neat, eco-conscious, and secure, ensuring products arrive fresh and intact. Delivery is fast and reliable, with most orders reaching customers within 2–4 days.",
];

const FEATURES = [
  {
    Icon: HiOutlineTag,
    title: "Eco-Friendly Value",
    description:
      "Discover the true worth of sustainable living. At CraftzLK, we offer premium handmade products crafted with natural, eco-friendly ingredients at fair prices that support both quality and sustainability without compromise.",
  },
  {
    Icon: HiOutlineHeart,
    title: "Customer Happiness",
    description:
      "We take pride in every happy customer. Each CraftzLK product is made with love, care, and tradition. Your satisfaction is our story, and we continuously strive to bring you authentic homemade goodness.",
  },
  {
    Icon: HiOutlineShieldCheck,
    title: "Quality You Can Trust",
    description:
      "Every item is carefully handcrafted and quality-checked to ensure freshness, safety, and authenticity. We stand behind the purity and traditional value of everything we create and deliver.",
  },
  {
    Icon: HiOutlineTruck,
    title: "Fresh & Fast Delivery",
    description:
      "Need it fresh? We ensure quick and secure delivery so your handmade products reach you in perfect condition. Because we understand—freshness and timing matter in every homemade product.",
  },
];

export default function HomeCustomerReviewSummary() {
  const [reviewsOpen, setReviewsOpen] = useState(false);

  return (
    <div className="home-customer-block">
      <section
        className="home-review-summary relative w-full bg-transparent px-3 py-8 sm:px-4 sm:py-10 md:px-6 md:py-10 lg:px-8 lg:py-11"
        aria-labelledby="home-review-summary-heading"
      >
        <div className="home-review-summary__inner">
          <h2 id="home-review-summary-heading" className="home-review-summary__title">
            <span className="home-review-summary__title-lead">Customers rate </span>
            <span className="home-review-summary__brand">{BRAND}</span>
            <span
              className="home-review-summary__score"
              aria-label={`${REVIEW_AVERAGE} out of 5 stars`}
            >
              {REVIEW_AVERAGE} <span aria-hidden="true">★</span>
            </span>
            <span className="home-review-summary__count">({REVIEW_TOTAL_LABEL})</span>
          </h2>

          <div className="home-review-summary__body">
            {SUMMARY_PARAGRAPHS.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>

          <ul
            className="home-review-summary__tags"
            aria-label="Top themes from customer reviews"
          >
            {TAGS.map((label) => (
              <li key={label}>
                <span className="home-review-summary__pill">
                  {label}
                  <HiHandThumbUp className="home-review-summary__thumb" aria-hidden="true" />
                </span>
              </li>
            ))}
          </ul>

          <p className="home-review-summary__ai-note">
            <HiSparkles className="home-review-summary__ai-icon" aria-hidden="true" />
            AI-powered review summary based on recent customer reviews
          </p>

          <button
            type="button"
            className="home-review-summary__cta"
            onClick={() => setReviewsOpen(true)}
          >
            View customer reviews
          </button>
        </div>
      </section>

      <section className="home-value-strip" aria-label="Why choose CraftzLK">
        <div className="home-value-strip__inner">
          <ul className="home-value-strip__grid">
            {FEATURES.map(({ Icon, title, description }) => (
              <li key={title} className="home-value-strip__item">
                <Icon className="home-value-strip__icon" aria-hidden="true" />
                <h3 className="home-value-strip__title">{title}</h3>
                <p className="home-value-strip__text">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CustomerReviewsModal open={reviewsOpen} onClose={() => setReviewsOpen(false)} />
    </div>
  );
}
