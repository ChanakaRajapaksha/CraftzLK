import { useState, useEffect, useContext, useLayoutEffect, useMemo, useCallback } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
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
  const context = useContext(MyContext);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme === ADMIN_THEMES.dark ? ADMIN_THEMES.dark : ADMIN_THEMES.light);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) =>
      current === ADMIN_THEMES.dark ? ADMIN_THEMES.light : ADMIN_THEMES.dark
    );
  }, []);

  useLayoutEffect(() => {
    setThemeState(getStoredAdminTheme());
  }, []);

  useEffect(() => {
    storeAdminTheme(theme);
    document.documentElement.classList.toggle("admin-dash-theme-dark", isAdminDarkTheme(theme));
  }, [theme]);

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
      <div className={`admin-dash${isAdminDarkTheme(theme) ? " admin-dash--dark" : ""}`}>
        <AdminSidebar />
        <main className="admin-dash__main">
          <AdminTopBar />
          <div className="admin-dash__page-content">
            <Outlet context={adminContextValue} />
          </div>
        </main>
      </div>
    </AdminThemeContext.Provider>
  );
}
