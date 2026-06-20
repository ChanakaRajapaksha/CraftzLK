export const ADMIN_THEME_STORAGE_KEY = "craftzlk-admin-theme";

export const ADMIN_THEMES = {
  light: "light",
  dark: "dark",
};

export function getStoredAdminTheme() {
  try {
    const value = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    if (value === ADMIN_THEMES.dark || value === ADMIN_THEMES.light) {
      return value;
    }
  } catch {
    /* ignore */
  }
  return ADMIN_THEMES.light;
}

export function storeAdminTheme(theme) {
  try {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function isAdminDarkTheme(theme) {
  return theme === ADMIN_THEMES.dark;
}
