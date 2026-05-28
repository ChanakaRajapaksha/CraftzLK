import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
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

/** First visit to home (per tab session): 3D intro splash, then home content mounts. */
export default function HomeGate() {
  const [showSplash, setShowSplash] = useState(() => !shouldSkipSplash());
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (!showSplash) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSplash]);

  return (
    <>
      <motion.div
        className="home-gate__enter"
        initial={false}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={showSplash}
      >
        <Home />
      </motion.div>

      <AnimatePresence
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
          <HomeIntroSplash key="craftzlk-intro" onComplete={handleSplashComplete} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
