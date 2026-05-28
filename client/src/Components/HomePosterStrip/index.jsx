import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { HOME_RAIL_SECTION_FIRST, HOME_SECTION_INNER } from "../homeRailLayout";
import "./HomePosterStrip.css";

const POSTERS = [
  {
    src: "/images/poster_images/Minimalist-Eco-Friendly-Product-Banner.png",
    alt: "Minimalist eco-friendly product showcase",
  },
  {
    src: "/images/poster_images/Premium-Craftsmanship-Homepage-Banner.png",
    alt: "Premium craftsmanship banner",
  },
  {
    src: "/images/poster_images/Rustic-Sri-Lankan-Food-Display-Poster.png",
    alt: "Rustic Sri Lankan food display",
  },
];

const POSTER_CARD_CLASS =
  "group relative flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-b from-white/50 via-white/30 to-white/[0.15] shadow-[0_10px_40px_-14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-black/[0.04] backdrop-blur-md transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.9)]";

function PosterCard({ item }) {
  return (
    <article className={POSTER_CARD_CLASS}>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center rounded-[calc(1rem-1px)] bg-white/15 p-2 sm:p-2.5 md:p-3">
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-auto w-full max-w-full object-contain object-center transition-[transform] duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
    </article>
  );
}

/**
 * Poster tiles — Swiper carousel on mobile (one slide + dots), three across from md up.
 */
const HomePosterStrip = () => {
  return (
    <section
      className={`${HOME_RAIL_SECTION_FIRST} pb-4 sm:pb-5 md:pb-5 lg:pb-6`}
      aria-label="Promotional posters"
    >
      <div className={HOME_SECTION_INNER}>
        <Swiper
          className="home-poster-strip__swiper"
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={12}
          pagination={{ clickable: true }}
          watchOverflow
          breakpoints={{
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
        >
          {POSTERS.map((item) => (
            <SwiperSlide key={item.src}>
              <PosterCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default HomePosterStrip;
