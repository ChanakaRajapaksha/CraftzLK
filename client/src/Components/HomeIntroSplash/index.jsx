import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import "./HomeIntroSplash.css";

const exitEase = [0.22, 1, 0.36, 1];

function getLoaderTiming() {
  if (typeof window === "undefined") {
    return { stepMs: 40, holdAt100Ms: 280 };
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return { stepMs: 0, holdAt100Ms: 120 };
  }
  // One integer tick per step: 0 → 1 → 2 → … → 100 (~4s), brief pause at 100%.
  return { stepMs: 40, holdAt100Ms: 280 };
}

export default function HomeIntroSplash({ onComplete }) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const timing = useMemo(() => getLoaderTiming(), []);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setPercent(0);
    let stepId;
    let doneId;

    if (timing.stepMs === 0) {
      setPercent(100);
      doneId = window.setTimeout(() => onCompleteRef.current?.(), timing.holdAt100Ms);
      return () => window.clearTimeout(doneId);
    }

    let current = 0;
    stepId = window.setInterval(() => {
      current += 1;
      setPercent(current);
      if (current >= 100) {
        window.clearInterval(stepId);
        doneId = window.setTimeout(() => onCompleteRef.current?.(), timing.holdAt100Ms);
      }
    }, timing.stepMs);

    return () => {
      window.clearInterval(stepId);
      window.clearTimeout(doneId);
    };
  }, [timing.holdAt100Ms, timing.stepMs]);

  return (
    <motion.div
      className="home-intro-splash"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
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
                  <span
                    className="home-intro-splash__fill"
                    style={{ transform: `scaleX(${percent / 100})` }}
                  />
                </div>
                <span className="home-intro-splash__percent" aria-hidden="true">
                  {percent}%
                </span>
              </div>
              <span className="home-intro-splash__hint">Preparing your experience</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
