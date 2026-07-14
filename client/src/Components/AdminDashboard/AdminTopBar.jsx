import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDarkMode, MdLightMode, MdNotificationsNone, MdStorefront } from "react-icons/md";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import { DEFAULT_STORE_LOGO } from "../../utils/storeBrand";
import { STOREFRONT_HOME_PATH } from "./adminNav";
import AdminNotificationsPanel from "./AdminNotificationsPanel";
import { useAdminTheme } from "./AdminThemeContext";
import { getAdminNotificationSample } from "./adminNotificationUtils";

export default function AdminTopBar() {
  const { isDark, toggleTheme } = useAdminTheme();
  const { storeLogo } = useContext(MyContext);
  const [panelOpen, setPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetchDataFromApi("/api/admin-notifications");
      if (typeof res?.unreadCount === "number") {
        setUnreadCount(res.unreadCount);
      } else {
        setUnreadCount(getAdminNotificationSample().unreadCount);
      }
    } catch {
      setUnreadCount(getAdminNotificationSample().unreadCount);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <header className="admin-dash__topbar">
      <div className="admin-dash__topbar-start">
        <div>
          <p className="admin-dash__topbar-eyebrow">CraftzLK Admin</p>
          <p className="admin-dash__topbar-tagline">Store management console</p>
        </div>
      </div>

      <div className="admin-dash__topbar-actions">
        <Link to={STOREFRONT_HOME_PATH} className="admin-dash__topbar-store">
          <MdStorefront className="admin-dash__topbar-store-icon" aria-hidden />
          <span className="admin-dash__topbar-store-text">View Home Page</span>
        </Link>

        <button
          type="button"
          className="admin-dash__topbar-theme"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={isDark}
        >
          <span className="admin-dash__topbar-theme-icon" aria-hidden>
            {isDark ? <MdLightMode /> : <MdDarkMode />}
          </span>
          <span className="admin-dash__topbar-theme-text">{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        <div className="admin-dash__topbar-notif-wrap">
          <button
            type="button"
            className={`admin-dash__topbar-bell${panelOpen ? " admin-dash__topbar-bell--active" : ""}`}
            onClick={() => setPanelOpen((open) => !open)}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
          >
            <MdNotificationsNone aria-hidden />
            {unreadCount > 0 && (
              <span className="admin-dash__topbar-badge">{badgeLabel}</span>
            )}
          </button>

          <AdminNotificationsPanel
            open={panelOpen}
            onClose={() => setPanelOpen(false)}
            onUnreadChange={setUnreadCount}
          />
        </div>
      </div>
    </header>
  );
}
