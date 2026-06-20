import { createContext, useContext } from "react";
import { ADMIN_THEMES } from "./adminTheme";

const AdminThemeContext = createContext({
  theme: ADMIN_THEMES.light,
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export default AdminThemeContext;
