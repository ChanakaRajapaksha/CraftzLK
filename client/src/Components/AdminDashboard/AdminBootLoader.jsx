import { motion, useReducedMotion } from "framer-motion";
import { getStoredAdminTheme, isAdminDarkTheme } from "./adminTheme";
import { DEFAULT_STORE_LOGO } from "../../utils/storeBrand";
import "./AdminBootLoader.css";

export default function AdminBootLoader() {
  const reduceMotion = useReducedMotion();
  const isDark = isAdminDarkTheme(getStoredAdminTheme());

  return (
    <div
      className={`admin-boot${isDark ? " admin-boot--dark" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading admin dashboard"
    >
      <div className="admin-boot__glow admin-boot__glow--a" aria-hidden />
      <div className="admin-boot__glow admin-boot__glow--b" aria-hidden />
      <div className="admin-boot__grain" aria-hidden />

      <motion.div
        className="admin-boot__card"
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-boot__mark">
          <span className="admin-boot__ring" aria-hidden />
          <span className="admin-boot__ring admin-boot__ring--delay" aria-hidden />
          <img src={DEFAULT_STORE_LOGO} alt="" className="admin-boot__logo" decoding="async" />
        </div>

        <p className="admin-boot__eyebrow">CraftzLK Admin</p>
        <h1 className="admin-boot__title">Preparing dashboard</h1>
        <p className="admin-boot__hint">Restoring your session and workspace</p>

        <div className="admin-boot__progress" aria-hidden>
          <span className="admin-boot__progress-bar" />
        </div>
      </motion.div>
    </div>
  );
}
