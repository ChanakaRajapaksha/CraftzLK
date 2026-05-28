import { Link } from "react-router-dom";
import { useEffect, useId } from "react";
import { IoChevronForward } from "react-icons/io5";
import { HOME_RAIL_SECTION, HOME_SECTION_INNER_DIVIDED } from "../homeRailLayout";
import "./PopularCategoriesGrid.css";

const TILES = [
  {
    gridArea: "a",
    title: "Home & Living",
    image: "/images/categories_images/category-1.webp",
    to: "/products",
  },
  {
    gridArea: "b",
    title: "Fashion & Accessories",
    image: "/images/categories_images/category-2.webp",
    to: "/products",
  },
  {
    gridArea: "c",
    title: "Kids & Baby",
    image: "/images/categories_images/category-3.webp",
    to: "/products",
  },
  {
    gridArea: "d",
    title: "Art & Collectibles",
    image: "/images/categories_images/category-4.webp",
    to: "/products",
  },
];

const CATEGORIES_UNDERLINE_PATH =
  "M 1.5 9.2 C 32 4.8 62 11.5 92 7.2 C 122 2.8 150 10.2 178 6.5 C 202 3.8 224 2.2 246 5.8 C 258 7.5 268 4.2 272 2.8";
const CATEGORIES_UNDERLINE_VIEWBOX = "0 0 276 14";

function PopularCategoriesTitleUnderline() {
  const rawId = useId().replace(/:/g, "");
  const lineGradId = `pcg-line-${rawId}`;
  const dotGradId = `pcg-dot-${rawId}`;

  return (
    <span className="relative inline-block min-w-0 pb-2 sm:pb-2.5">
      <span className="relative z-10">Categories</span>
      <svg
        className="popular-categories-underline pointer-events-none absolute -bottom-0.5 left-0 h-[15px] w-[calc(100%+0.35rem)] min-w-full overflow-visible sm:h-[17px]"
        viewBox={CATEGORIES_UNDERLINE_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#c9a961" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#8b6f47" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={dotGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="100%" stopColor="#8b6f47" />
          </radialGradient>
        </defs>
        <path
          className="pcg-line-ghost"
          d={CATEGORIES_UNDERLINE_PATH}
          fill="none"
          stroke="rgba(61,40,23,0.14)"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="pcg-line-main"
          d={CATEGORIES_UNDERLINE_PATH}
          fill="none"
          stroke={`url(#${lineGradId})`}
          strokeWidth={2.35}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className="pcg-dot"
          cx={271}
          cy={2.8}
          r={2.6}
          fill={`url(#${dotGradId})`}
        />
      </svg>
    </span>
  );
}

function CategoryPromoCard({ title, image, to, gridArea, minHeightClass }) {
  return (
    <Link
      to={to}
      className={`pcg-card relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/30 shadow-md outline-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-vintage-brown/50 ${minHeightClass}`}
      style={{ gridArea }}
    >
      <div className="pcg-card-media pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className="pcg-card-shade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20"
        aria-hidden="true"
      />
      <div className="relative flex min-h-full flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:gap-2.5 sm:px-5 sm:py-10">
        <h3 className="max-w-[14ch] font-sans text-xl font-bold leading-tight tracking-wide text-white sm:max-w-none sm:text-2xl md:text-3xl">
          {title}
        </h3>
        <span className="pcg-card-cta inline-flex items-center gap-0.5 font-sans text-sm font-medium tracking-wide text-white/95 sm:text-base">
          Explore
          <IoChevronForward className="h-[1.1em] w-[1.1em]" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

const PopularCategoriesGrid = () => {
  useEffect(() => {
    const warmImages = () => {
      TILES.forEach(({ image }) => {
        const img = new Image();
        img.decoding = "async";
        img.src = image;
      });
    };

    if (typeof window === "undefined") return undefined;

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmImages, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(warmImages, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section
      className={HOME_RAIL_SECTION}
      aria-labelledby="popular-categories-heading"
    >
      <div className={HOME_SECTION_INNER_DIVIDED}>
        <h2
          id="popular-categories-heading"
          className="mb-5 flex w-full flex-wrap items-baseline justify-center gap-x-2 text-center font-heading text-lg font-bold uppercase tracking-[0.12em] text-vintage-brown sm:mb-6 sm:gap-x-3 sm:text-xl md:text-2xl"
        >
          <span>Popular</span>
          <PopularCategoriesTitleUnderline />
        </h2>

        <div className="grid grid-cols-1 grid-rows-none gap-3 [grid-template-areas:'a'_'b'_'c'_'d'] sm:gap-4 md:min-h-[440px] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:gap-5 md:[grid-template-areas:'a_b_b'_'a_c_d'] lg:min-h-[520px] lg:gap-6">
          {TILES.map((tile, index) => (
            <CategoryPromoCard
              key={tile.gridArea}
              {...tile}
              minHeightClass={
                index === 0
                  ? "min-h-[280px] md:min-h-0"
                  : "min-h-[200px] md:min-h-0"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesGrid;
