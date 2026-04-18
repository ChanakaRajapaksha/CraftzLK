import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Images from public/images/slidebar_images — add files here when you add assets */
const SLIDES = [
  {
    src: "/images/slidebar_images/Artboard_3_1.webp",
    alt: "CraftzLK featured collection",
  },
  {
    src: "/images/slidebar_images/NEW_MENS_FACEBOOK_BANNER_new_web.webp",
    alt: "Featured banner",
  },
  {
    src: "/images/slidebar_images/slider_1.jpg",
    alt: "Featured banner",
  },
  {
    src: "/images/slidebar_images/slider_2.jpg",
    alt: "Featured banner",
  },
];

const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 1300;

const easeReveal = [0.76, 0, 0.24, 1];

/** Curtain wipe + parallax — direction comes from how the user moved through the deck */
const slideVariants = {
  enter: (direction) => ({
    clipPath:
      direction >= 0
        ? "inset(0 0 0 100%)"
        : "inset(0 100% 0 0)",
    opacity: 1,
  }),
  center: {
    clipPath: "inset(0 0 0 0)",
    opacity: 1,
    transition: {
      clipPath: { duration: TRANSITION_MS / 1000, ease: easeReveal },
      opacity: { duration: 0.25 },
    },
  },
  exit: (direction) => ({
    clipPath:
      direction >= 0
        ? "inset(0 100% 0 0)"
        : "inset(0 0 0 100%)",
    opacity: 1,
    transition: {
      clipPath: { duration: TRANSITION_MS / 1000, ease: easeReveal },
    },
  }),
};

/** Inner image: subtle parallax shift on enter/exit + slow Ken-Burns zoom while resting */
const imageVariants = {
  enter: (direction) => ({
    x: direction >= 0 ? "8%" : "-8%",
    scale: 1.12,
  }),
  center: {
    x: "0%",
    scale: 1.04,
    transition: {
      x: { duration: TRANSITION_MS / 1000, ease: easeReveal },
      scale: { duration: AUTOPLAY_MS / 1000 + 1, ease: "linear" },
    },
  },
  exit: (direction) => ({
    x: direction >= 0 ? "-6%" : "6%",
    scale: 1.0,
    transition: {
      x: { duration: TRANSITION_MS / 1000, ease: easeReveal },
      scale: { duration: TRANSITION_MS / 1000, ease: easeReveal },
    },
  }),
};

/** Bright sweep that travels with the wipe edge (only visible during transition) */
const sweepVariants = {
  enter: (direction) => ({
    left: direction >= 0 ? "100%" : "-2%",
    opacity: 0,
  }),
  center: (direction) => ({
    left: direction >= 0 ? "-2%" : "100%",
    opacity: [0, 0.55, 0.55, 0],
    transition: {
      duration: TRANSITION_MS / 1000,
      ease: easeReveal,
      times: [0, 0.15, 0.85, 1],
    },
  }),
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Dots after the active slide shrink (Instagram-style); farther = smaller */
function afterDotScale(index, active) {
  if (index <= active) return 1;
  const steps = index - active;
  return Math.max(0.38, 1 - steps * 0.2);
}

const CategoryHeroSlider = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [fillKey, setFillKey] = useState(0);
  const [paused, setPaused] = useState(false);
  /** True while exit/enter animation runs — autoplay waits so it never stacks broken transitions */
  const transitioningRef = useRef(false);
  const skipTransitionLock = useRef(true);

  const goTo = useCallback(
    (next) => {
      const safeNext = ((next % SLIDES.length) + SLIDES.length) % SLIDES.length;
      if (safeNext === active) return;
      setDirection(safeNext > active || (active === SLIDES.length - 1 && safeNext === 0) ? 1 : -1);
      setActive(safeNext);
    },
    [active]
  );

  const goPrev = () => goTo(active - 1);
  const goNext = () => goTo(active + 1);

  useEffect(() => {
    setFillKey((k) => k + 1);
  }, [active]);

  useEffect(() => {
    if (skipTransitionLock.current) {
      skipTransitionLock.current = false;
      return;
    }
    transitioningRef.current = true;
    const t = window.setTimeout(() => {
      transitioningRef.current = false;
    }, TRANSITION_MS + 80);
    return () => window.clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (SLIDES.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      if (transitioningRef.current) return;
      setDirection(1);
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  /** Clicks outside the whole carousel clear hover-pause (e.g. after using header / mega menu) */
  useEffect(() => {
    const onDocPointerDown = (e) => {
      const root = sectionRef.current;
      if (!root || root.contains(e.target)) return;
      setPaused(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, []);

  const slide = SLIDES[active];

  return (
    <section
      ref={sectionRef}
      className="category-hero-slider"
      aria-label="Featured slides"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }}
    >
      <div
        className="category-hero-slider__viewport"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={slide.src}
            className="category-hero-slider__slide"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ willChange: "clip-path, opacity" }}
          >
            <motion.img
              src={slide.src}
              alt={slide.alt}
              className="category-hero-slider__img"
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              loading={active === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              style={{ willChange: "transform" }}
            />

            <motion.span
              className="category-hero-slider__sweep"
              aria-hidden
              custom={direction}
              variants={sweepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {SLIDES.length > 1 && (
        <>
          <button
            type="button"
            className="category-hero-slider__edge category-hero-slider__edge--prev"
            onClick={goPrev}
            aria-label="Previous slide"
          />
          <button
            type="button"
            className="category-hero-slider__edge category-hero-slider__edge--next"
            onClick={goNext}
            aria-label="Next slide"
          />

          <div
            className="category-hero-slider__rail"
            role="tablist"
            aria-label="Slide navigation"
          >
            {SLIDES.map((_, index) => {
              if (index === active) {
                return (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected
                    className="category-hero-slider__pill"
                    onClick={() => goTo(index)}
                    aria-label={`Slide ${index + 1}, progress`}
                  >
                    <span className="category-hero-slider__pill-track" aria-hidden />
                    <span
                      key={fillKey}
                      className="category-hero-slider__pill-fill"
                      style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                      aria-hidden
                    />
                  </button>
                );
              }

              const isBefore = index < active;
              const scale = isBefore ? 1 : afterDotScale(index, active);

              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={false}
                  className={`category-hero-slider__dot ${isBefore ? "category-hero-slider__dot--before" : "category-hero-slider__dot--after"}`}
                  style={{ transform: `scale(${scale})` }}
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

export default CategoryHeroSlider;
