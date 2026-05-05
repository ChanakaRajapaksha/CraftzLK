import { motion } from "framer-motion";
import "./HomeIntroSplash.css";

const exitEase = [0.22, 1, 0.36, 1];

export default function HomeIntroSplash() {
  return (
    <motion.div
      className="home-intro-splash"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading CraftzLK"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.035,
        transition: { duration: 0.55, ease: exitEase },
      }}
    >
      <div className="home-intro-splash__noise" aria-hidden />
      <div className="home-intro-splash__orb home-intro-splash__orb--a" aria-hidden />
      <div className="home-intro-splash__orb home-intro-splash__orb--b" aria-hidden />

      <div className="home-intro-splash__stage">
        <span className="home-intro-splash__chip home-intro-splash__chip--1" aria-hidden />
        <span className="home-intro-splash__chip home-intro-splash__chip--2" aria-hidden />

        <div className="home-intro-splash__float">
          <div className="home-intro-splash__slab">
            <div className="home-intro-splash__inner">
              <div className="home-intro-splash__logo-wrap">
                <img
                  src="/images/craftzlk.png"
                  alt=""
                  className="home-intro-splash__logo"
                  decoding="async"
                />
              </div>
              <p className="home-intro-splash__tagline">
                Handmade · Curated · Sri Lankan craft
              </p>
              <div className="home-intro-splash__loader">
                <div className="home-intro-splash__track">
                  <span className="home-intro-splash__fill" />
                </div>
              </div>
              <span className="home-intro-splash__hint">Preparing your experience</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
