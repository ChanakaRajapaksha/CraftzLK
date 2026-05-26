import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import "./HomeHeroBanner.css";

const HERO_BANNER_SRC = "/images/hero_banner.webp";

/**
 * Full-bleed promo strip with scroll parallax on the artwork.
 */
export default function HomeHeroBanner() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["-14%", "14%"]
  );

  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [1, 1, 1] : [1.06, 1, 1.06]
  );

  return (
    <section
      ref={sectionRef}
      className="home-hero-banner"
      aria-label="Promotional banner"
    >
      <div className="home-hero-banner__layer" aria-hidden="true">
        <motion.img
          src={HERO_BANNER_SRC}
          alt=""
          className="home-hero-banner__img"
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{
            y: imageY,
            scale: imageScale,
          }}
        />
      </div>
      <div className="home-hero-banner__veil" aria-hidden="true" />
    </section>
  );
}
