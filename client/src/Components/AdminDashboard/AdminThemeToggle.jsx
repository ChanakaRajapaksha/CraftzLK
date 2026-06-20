import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useAdminTheme } from "./AdminThemeContext";
import { ADMIN_THEMES } from "./adminTheme";

export default function AdminThemeToggle({ compact = false }) {
  const { theme, setTheme, isDark } = useAdminTheme();

  return (
    <div className={`admin-dash__theme-toggle${compact ? " admin-dash__theme-toggle--compact" : ""}`}>
      <div className="admin-dash__theme-toggle-label">
        {isDark ? <MdDarkMode aria-hidden /> : <MdLightMode aria-hidden />}
        <span>{compact ? "Theme" : "Dark theme"}</span>
      </div>
      <label className="admin-dash__theme-switch" aria-label="Toggle dark theme">
        <input
          type="checkbox"
          checked={theme === ADMIN_THEMES.dark}
          onChange={(event) =>
            setTheme(event.target.checked ? ADMIN_THEMES.dark : ADMIN_THEMES.light)
          }
        />
        <span className="admin-dash__theme-switch-slider" />
      </label>
      <span className="admin-dash__theme-toggle-state">{isDark ? "On" : "Off"}</span>
    </div>
  );
}
