import { Link } from "react-router-dom";
import { useCallback, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HOME_RAIL_SECTION } from "../homeRailLayout";

const IMG_BASE = "/images/product_images/tea_powder.png";
const IMG_ZOOM = "/images/product_images/tea_powder_zoom.png";

const BASE_CARDS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  name: "Ranawara Tea Powder",
  price: "1,450",
}));

const ROWS = [
  BASE_CARDS,
  BASE_CARDS.map((c, i) => ({
    ...c,
    id: `na-row2-${i}`,
  })),
];

const GRID_CLASS =
  "flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:gap-6 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-5 lg:gap-6";

const glassCard =
  "rounded-[1.35rem] border border-white/55 bg-gradient-to-b from-white/45 via-white/25 to-white/[0.18] p-[1px] shadow-none ring-0 backdrop-blur-2xl backdrop-saturate-150";

const glassInner =
  "overflow-hidden rounded-[1.3rem] bg-gradient-to-b from-white/20 to-transparent";

const glassPanelNoSave =
  "border-t border-white/35 bg-white/15 px-2.5 pb-3.5 pt-4 text-center backdrop-blur-xl sm:px-3.5 sm:pb-4 sm:pt-5";

const glassImageWell =
  "relative aspect-[1/1.05] overflow-hidden rounded-t-[1.28rem] bg-white/10 ring-0";

const glassButton =
  "mt-auto w-full max-w-full rounded-xl border border-white/50 bg-white/25 px-2 py-2.5 font-sans text-[0.65rem] font-bold uppercase tracking-widest text-vintage-brown shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md transition-[background,box-shadow,transform,border-color] hover:border-black/50 hover:bg-white/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_2px_rgba(0,0,0,0.45),0_10px_28px_-8px_rgba(0,0,0,0.45)] active:scale-[0.99] sm:px-3 sm:py-2.5 sm:text-[0.72rem]";

const CARD_WIDTH_CLASS =
  "group relative flex min-h-0 w-[min(90vw,380px)] shrink-0 snap-start flex-col sm:w-[min(84vw,360px)] md:w-auto md:min-w-0";

const ARRIVALS_UNDERLINE_PATH =
  "M 2 9.4 C 32 5.2 62 11 92 7.4 C 118 4.6 142 3.4 162 6.8 C 172 8.8 182 4.8 188 3";
const ARRIVALS_UNDERLINE_VIEWBOX = "0 0 192 14";

const TITLE_SCROLL_VIEWPORT = {
  once: false,
  amount: 0.45,
  margin: "40px 0px",
};

function NewArrivalsTitleUnderline({ reduceMotion }) {
  const rawId = useId().replace(/:/g, "");
  const lineGradId = `nal-line-${rawId}`;
  const dotGradId = `nal-dot-${rawId}`;

  const drawTransition = reduceMotion
    ? { duration: 0 }
    : {
        pathLength: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.4 },
      };

  const pathDone = { pathLength: 1, opacity: 1 };

  return (
    <span className="relative inline-block min-w-0 pb-2 sm:pb-2.5">
      <span className="relative z-10">Arrivals</span>
      <motion.svg
        className="pointer-events-none absolute -bottom-0.5 left-0 h-[15px] w-[calc(100%+0.35rem)] min-w-full overflow-visible sm:h-[17px]"
        viewBox={ARRIVALS_UNDERLINE_VIEWBOX}
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
          d={ARRIVALS_UNDERLINE_PATH}
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
          d={ARRIVALS_UNDERLINE_PATH}
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
          cx={188}
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

function rowVariants(reduceMotion) {
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: (dir) => ({
      x: dir > 0 ? "4rem" : "-4rem",
      opacity: 0,
      filter: "blur(12px)",
      scale: 0.97,
    }),
    animate: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? "-3rem" : "3rem",
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.98,
    }),
  };
}

const NewArrivalsRail = () => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const totalPages = ROWS.length;

  const goTo = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, next));
      if (clamped === page) return;
      setDirection(clamped > page ? 1 : -1);
      setPage(clamped);
    },
    [page, totalPages]
  );

  const variants = rowVariants(!!reduceMotion);

  return (
    <section
      className={HOME_RAIL_SECTION}
      aria-labelledby="new-arrivals-rail-heading"
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <h2
          id="new-arrivals-rail-heading"
          className="mb-5 flex flex-wrap items-baseline gap-x-2 font-heading text-lg font-bold uppercase tracking-[0.12em] text-vintage-brown sm:mb-6 sm:gap-x-3 sm:text-xl md:text-2xl"
        >
          <span>New</span>
          <NewArrivalsTitleUnderline reduceMotion={!!reduceMotion} />
        </h2>

        <div className="relative min-h-[280px] overflow-hidden sm:min-h-[320px] md:min-h-0 md:overflow-visible">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={page}
              role="list"
              custom={direction}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={
                reduceMotion
                  ? { duration: 0.2, ease: "easeOut" }
                  : {
                      type: "spring",
                      stiffness: 280,
                      damping: 32,
                      mass: 0.85,
                      opacity: { duration: 0.35 },
                      filter: { duration: 0.45 },
                    }
              }
              className={GRID_CLASS}
            >
              {ROWS[page].map((item) => (
                <article
                  key={item.id}
                  className={`${CARD_WIDTH_CLASS} ${glassCard}`}
                  role="listitem"
                >
                  <div
                    className={`bg-[#FADA5E] flex min-h-0 flex-1 flex-col ${glassInner} cursor-pointer`}
                  >
                    <div className="relative z-0">
                      <div className={glassImageWell}>
                        <img
                          src={IMG_BASE}
                          alt="Ranawara Tea Powder"
                          draggable={false}
                          className="relative z-10 h-full w-full object-cover object-center transition-[opacity,transform] duration-[450ms] ease-out group-hover:scale-105 group-hover:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:opacity-100"
                        />
                        <img
                          src={IMG_ZOOM}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          className="absolute inset-0 z-20 h-full w-full object-cover object-center opacity-0 scale-110 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:opacity-0"
                        />
                      </div>
                    </div>

                    <div
                      className={`relative flex flex-1 flex-col items-center ${glassPanelNoSave}`}
                    >
                      <h3 className="mb-1.5 font-heading text-sm font-semibold leading-snug text-vintage-brown drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] sm:mb-2 sm:text-base">
                        {item.name}
                      </h3>
                      <p className="mb-1 font-sans text-sm leading-snug text-vintage-brown sm:text-[0.9rem]">
                        <span className="font-semibold">Rs {item.price}</span>
                      </p>
                      
                      <button type="button" className={glassButton}>
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 pt-0 sm:mt-5">
          <div
            className="inline-flex items-center gap-2 font-sans text-xs text-vintage-brown/60 sm:gap-3 sm:text-sm"
            role="navigation"
            aria-label="New Arrivals pages"
          >
            <button
              type="button"
              className="flex h-7 min-w-[1.5rem] select-none items-center justify-center rounded-md text-base leading-none text-vintage-brown/80 transition-colors hover:bg-white/25 disabled:pointer-events-none disabled:opacity-35 sm:h-7 sm:text-lg"
              aria-label="Previous row"
              disabled={page <= 0}
              onClick={() => goTo(page - 1)}
            >
              ‹
            </button>
            <span className="min-w-[2.5rem] select-none text-center tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="flex h-7 min-w-[1.5rem] select-none items-center justify-center rounded-md text-base leading-none text-vintage-brown/80 transition-colors hover:bg-white/25 disabled:pointer-events-none disabled:opacity-35 sm:h-7 sm:text-lg"
              aria-label="Next row"
              disabled={page >= totalPages - 1}
              onClick={() => goTo(page + 1)}
            >
              ›
            </button>
          </div>
          <Link
            to="/products"
            className="inline-block rounded-xl border border-white/50 bg-white/30 px-9 py-2.5 font-sans text-[0.7rem] font-bold uppercase tracking-[0.14em] text-vintage-brown shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition-[background,box-shadow,color] hover:bg-white/45 hover:text-vintage-brown sm:text-xs"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivalsRail;
