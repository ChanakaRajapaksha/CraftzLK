import { useState, useEffect, useContext, useLayoutEffect, useMemo, useCallback } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import AdminRealtimeAlerts from "./AdminRealtimeAlerts";
import AdminThemeContext from "./AdminThemeContext";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import {
  ADMIN_THEMES,
  getStoredAdminTheme,
  isAdminDarkTheme,
  storeAdminTheme,
} from "./adminTheme";
import "./admin-dashboard.css";
import "./admin-dashboard-dark.css";

export default function AdminLayout() {
  const [catData, setCatData] = useState({ categoryList: [] });
  const [theme, setThemeState] = useState(getStoredAdminTheme);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const context = useContext(MyContext);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme === ADMIN_THEMES.dark ? ADMIN_THEMES.dark : ADMIN_THEMES.light);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) =>
      current === ADMIN_THEMES.dark ? ADMIN_THEMES.light : ADMIN_THEMES.dark
    );
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const toggleMobileNav = useCallback(() => setMobileNavOpen((open) => !open), []);

  useLayoutEffect(() => {
    setThemeState(getStoredAdminTheme());
  }, []);

  useEffect(() => {
    storeAdminTheme(theme);
    document.documentElement.classList.toggle("admin-dash-theme-dark", isAdminDarkTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchCategory = useCallback(() => {
    const adminFetch = fetchDataFromApi("/api/category").then((res) => {
      if (res?.categoryList) setCatData(res);
      return res;
    });
    const storeFetch = context?.refreshCategoryData?.() ?? Promise.resolve([]);
    return Promise.all([adminFetch, storeFetch]);
  }, [context?.refreshCategoryData]);

  useEffect(() => {
    fetchCategory();
  }, []);

  const adminContextValue = {
    catData,
    fetchCategory,
    setAlertBox: context?.setAlertBox ?? (() => {}),
  };

  const themeContextValue = useMemo(
    () => ({
      theme,
      isDark: isAdminDarkTheme(theme),
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <AdminThemeContext.Provider value={themeContextValue}>
      <div
        className={`admin-dash admin-dash--enter${isAdminDarkTheme(theme) ? " admin-dash--dark" : ""}${
          mobileNavOpen ? " admin-dash--nav-open" : ""
        }`}
      >
        <div
          className={`admin-dash__nav-backdrop${mobileNavOpen ? " admin-dash__nav-backdrop--visible" : ""}`}
          onClick={closeMobileNav}
          aria-hidden={!mobileNavOpen}
        />

        <AdminSidebar mobileOpen={mobileNavOpen} onCloseMobile={closeMobileNav} />

        <main className="admin-dash__main">
          <AdminRealtimeAlerts />
          <AdminTopBar
            mobileNavOpen={mobileNavOpen}
            onToggleMobileNav={toggleMobileNav}
          />
          <div className="admin-dash__page-content">
            <Outlet context={adminContextValue} />
          </div>
        </main>
      </div>
    </AdminThemeContext.Provider>
  );
}
