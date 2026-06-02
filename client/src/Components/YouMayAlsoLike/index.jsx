import { Link } from "react-router-dom";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getYouMayAlsoLikeProducts } from "../../data/sampleProductDetails";
import HomeRailAddToCartButton from "../HomeRailAddToCartButton";
import "./YouMayAlsoLike.css";

const GRID_CLASS =
  "ymal-grid flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:gap-6 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-5 lg:gap-6";

const glassCard =
  "rounded-[1.35rem] border border-white/55 bg-gradient-to-b from-white/45 via-white/25 to-white/[0.18] p-[1px] shadow-none ring-0 backdrop-blur-2xl backdrop-saturate-150";

const glassInner =
  "overflow-hidden rounded-[1.3rem] bg-gradient-to-b from-white/20 to-transparent";

const glassPanel =
  "border-t border-white/35 bg-white/15 px-2.5 pb-3.5 pt-6 text-center backdrop-blur-xl sm:px-3.5 sm:pb-4 sm:pt-7";

const glassPanelNoSave =
  "border-t border-white/35 bg-white/15 px-2.5 pb-3.5 pt-4 text-center backdrop-blur-xl sm:px-3.5 sm:pb-4 sm:pt-5";

const glassImageWell =
  "relative aspect-[1/1.05] overflow-hidden rounded-t-[1.28rem] bg-white/10 ring-0";

const glassButton =
  "mt-auto w-full max-w-full rounded-xl border border-white/50 bg-white/25 px-2 py-2.5 font-sans text-[0.65rem] font-bold uppercase tracking-widest text-vintage-brown shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md transition-[background,box-shadow,transform,border-color] hover:border-black/50 hover:bg-white/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_2px_rgba(0,0,0,0.45),0_10px_28px_-8px_rgba(0,0,0,0.45)] active:scale-[0.99] sm:px-3 sm:py-2.5 sm:text-[0.72rem]";

const CARD_WIDTH_CLASS =
  "group relative flex min-h-0 w-[min(90vw,380px)] shrink-0 snap-start flex-col sm:w-[min(84vw,360px)] md:w-auto md:min-w-0";

const LIKE_UNDERLINE_PATH =
  "M 2 9.4 C 20 5.2 38 11 54 7.4 C 68 4.6 84 3.4 94 6.8 C 99.5 8.8 104.5 4.8 107 3";
const LIKE_UNDERLINE_VIEWBOX = "0 0 112 14";

const TITLE_SCROLL_VIEWPORT = {
  once: true,
  amount: 0.45,
  margin: "40px 0px",
};

function YouMayAlsoLikeTitleUnderline({ reduceMotion }) {
  const rawId = useId().replace(/:/g, "");
  const lineGradId = `ymal-line-${rawId}`;
  const dotGradId = `ymal-dot-${rawId}`;

  const drawTransition = reduceMotion
    ? { duration: 0 }
    : {
        pathLength: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.4 },
      };

  const pathDone = { pathLength: 1, opacity: 1 };

  return (
    <span className="relative inline-block min-w-0 pb-2 sm:pb-2.5">
      <span className="relative z-10">like</span>
      <motion.svg
        className="pointer-events-none absolute -bottom-0.5 left-0 h-[15px] w-[calc(100%+0.35rem)] min-w-full overflow-visible sm:h-[17px]"
        viewBox={LIKE_UNDERLINE_VIEWBOX}
        preserveAspectRatio="none"
        aria-hidden="true"
        initial={false}
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
        <motion.path
          d={LIKE_UNDERLINE_PATH}
          fill="none"
          stroke="rgba(61,40,23,0.14)"
          strokeWidth={2.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? pathDone : { pathLength: 0, opacity: 0 }}
          whileInView={pathDone}
          viewport={TITLE_SCROLL_VIEWPORT}
          transition={drawTransition}
        />
        <motion.path
          d={LIKE_UNDERLINE_PATH}
          fill="none"
          stroke={`url(#${lineGradId})`}
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? pathDone : { pathLength: 0, opacity: 0.75 }}
          whileInView={pathDone}
          viewport={TITLE_SCROLL_VIEWPORT}
          transition={drawTransition}
        />
        <motion.circle
          cx={108}
          cy={3.1}
          r={2.45}
          fill={`url(#${dotGradId})`}
          initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={TITLE_SCROLL_VIEWPORT}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay: 0.92, type: "spring", stiffness: 380, damping: 18 }
          }
        />
      </motion.svg>
    </span>
  );
}

function formatSaveRs(oldPrice, price) {
  if (!oldPrice || oldPrice <= price) return null;
  return (oldPrice - price).toLocaleString("en-US");
}

function shortName(name) {
  if (name.length <= 42) return name;
  return `${name.slice(0, 39).trim()}…`;
}

export default function YouMayAlsoLike({ currentProductId }) {
  const products = getYouMayAlsoLikeProducts(currentProductId, 5);
  const reduceMotion = useReducedMotion();

  if (products.length === 0) return null;

  return (
    <section className="ymal" aria-labelledby="ymal-heading">
      <div className="ymal__inner">
        <h2
          id="ymal-heading"
          className="ymal__title mb-5 flex flex-wrap items-baseline gap-x-2 font-heading text-lg font-bold uppercase tracking-[0.12em] text-vintage-brown sm:mb-6 sm:gap-x-3 sm:text-xl md:text-2xl"
        >
          <span>You may also</span>
          <YouMayAlsoLikeTitleUnderline reduceMotion={!!reduceMotion} />
        </h2>

        <div className={GRID_CLASS} role="list">
          {products.map((item) => {
            const imageBase = item.images?.[0] ?? "";
            const imageZoom = item.images?.[1] ?? imageBase;
            const saveRs = formatSaveRs(item.oldPrice, item.price);
            const panelClass = saveRs ? glassPanel : glassPanelNoSave;

            return (
              <article
                key={item.id}
                className={`${CARD_WIDTH_CLASS} ${glassCard}`}
                role="listitem"
              >
                <div className={`bg-[#FADA5E] flex min-h-0 flex-1 flex-col ${glassInner}`}>
                  <div className="relative z-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vintage-brown"
                      aria-label={`View details for ${item.name}`}
                    >
                      <div className={glassImageWell}>
                        <img
                          src={imageBase}
                          alt={item.name}
                          draggable={false}
                          className="relative z-10 h-full w-full object-cover object-center transition-[opacity,transform] duration-[450ms] ease-out group-hover:scale-105 group-hover:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:opacity-100"
                        />
                        <img
                          src={imageZoom}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          className="absolute inset-0 z-20 h-full w-full object-cover object-center opacity-0 scale-110 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:opacity-0"
                        />
                      </div>
                    </Link>
                  </div>

                  <div className={`relative -mt-2 flex flex-1 flex-col items-center ${panelClass}`}>
                    {saveRs && (
                      <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/35 bg-emerald-600/95 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-white shadow-[0_4px_16px_rgba(22,101,52,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-[0.65rem]">
                        SAVE RS {saveRs}
                      </span>
                    )}

                    <h3 className="mb-1.5 mt-0.5 font-heading text-sm font-semibold leading-snug text-vintage-brown drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] sm:text-base">
                      <Link
                        to={`/product/${item.id}`}
                        className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vintage-brown"
                      >
                        {shortName(item.name)}
                      </Link>
                    </h3>

                    <p className="mb-1 font-sans text-sm leading-snug text-vintage-brown sm:text-[0.9rem]">
                      {item.oldPriceDisplay && (
                        <span className="mr-2 text-red-700/95 line-through decoration-1">
                          {item.oldPriceDisplay}
                        </span>
                      )}
                      <span className="font-semibold">{item.priceDisplay}</span>
                    </p>

                    <HomeRailAddToCartButton productId={item.id} className={glassButton} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
