import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import HomeIntroSplash from "../../Components/HomeIntroSplash";
import Home from "./index";

const SESSION_KEY = "craftzlk_home_intro_seen";

function shouldSkipSplash() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function minSplashMs() {
  if (typeof window === "undefined") return 2200;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 420
    : 2600;
}

/** First visit to home (per tab session): 3D intro splash, then home content mounts. */
export default function HomeGate() {
  const [showSplash, setShowSplash] = useState(() => !shouldSkipSplash());

  useEffect(() => {
    if (!showSplash) return undefined;
    const id = window.setTimeout(() => {
      setShowSplash(false);
    }, minSplashMs());
    return () => window.clearTimeout(id);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSplash]);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        try {
          if (sessionStorage.getItem(SESSION_KEY) !== "1") {
            sessionStorage.setItem(SESSION_KEY, "1");
          }
        } catch {
          /* ignore */
        }
      }}
    >
      {showSplash ? (
        <HomeIntroSplash key="craftzlk-intro" />
      ) : (
        <motion.div
          key="craftzlk-home"
          className="home-gate__enter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Home />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
