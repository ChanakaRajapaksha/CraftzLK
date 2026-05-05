import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./CategoryHeroSlider.css";

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

/** Build variants — transform + opacity only (compositor-friendly; avoids clip-path repaint during scroll) */
function buildSlideVariants(durationSec) {
  return {
    enter: (direction) => ({
      x: direction >= 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { duration: durationSec, ease: easeReveal },
        opacity: { duration: Math.min(0.4, durationSec * 0.45), ease: "easeOut" },
      },
    },
    exit: (direction) => ({
      x: direction >= 0 ? "-12%" : "12%",
      opacity: 0,
      transition: {
        x: { duration: durationSec, ease: easeReveal },
        opacity: { duration: durationSec * 0.55, ease: easeReveal },
      },
    }),
  };
}

/** Inner image: short parallax on enter/exit only — no always-on scale (that caused scroll jank) */
function buildImageVariants(durationSec) {
  return {
    enter: (direction) => ({
      x: direction >= 0 ? "4%" : "-4%",
      scale: 1.05,
    }),
    center: {
      x: "0%",
      scale: 1,
      transition: {
        x: { duration: durationSec, ease: easeReveal },
        scale: { duration: durationSec, ease: easeReveal },
      },
    },
    exit: (direction) => ({
      x: direction >= 0 ? "-3%" : "3%",
      scale: 1,
      transition: {
        x: { duration: durationSec, ease: easeReveal },
        scale: { duration: durationSec * 0.6, ease: easeReveal },
      },
    }),
  };
}

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
  const reduceMotion = useReducedMotion();
  const transSec = reduceMotion ? 0.01 : TRANSITION_MS / 1000;
  const slideVariants = useMemo(() => buildSlideVariants(transSec), [transSec]);
  const imageVariants = useMemo(() => buildImageVariants(transSec), [transSec]);

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [fillKey, setFillKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrollPause, setScrollPause] = useState(false);
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

  /** Pause lightweight CSS animations while scrolling so the page keeps moving smoothly */
  useEffect(() => {
    let done = false;
    let endTimer;
    const settleMs = 120;
    const onScroll = () => {
      if (done) return;
      setScrollPause(true);
      window.clearTimeout(endTimer);
      endTimer = window.setTimeout(() => setScrollPause(false), settleMs);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      done = true;
      window.clearTimeout(endTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const slide = SLIDES[active];

  return (
    <section
      ref={sectionRef}
      className={`category-hero-slider${scrollPause ? " category-hero-slider--scrolling" : ""}`}
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
      </div>
    </section>
  );
};

export default CategoryHeroSlider;
