export const DEFAULT_STORE_LOGO = "/images/craftzlk.png";
export const DEFAULT_STORE_FAVICON = "/images/craftzlk.png";

export function resolveStoreLogoUrl(logo) {
  if (!logo) return DEFAULT_STORE_LOGO;
  if (typeof logo === "string" && logo.trim()) return logo.trim();
  if (typeof logo === "object" && logo.url?.trim()) return logo.url.trim();
  return DEFAULT_STORE_LOGO;
}

export function resolveStoreFaviconUrl(favicon) {
  if (!favicon) return "";
  if (typeof favicon === "string" && favicon.trim()) return favicon.trim();
  if (typeof favicon === "object" && favicon.url?.trim()) return favicon.url.trim();
  return "";
}

export function withStoreAssetCacheBust(url) {
  if (!url || url.startsWith("/images/")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

export function applyDocumentFavicon(url) {
  const href = url?.trim() || DEFAULT_STORE_FAVICON;
  let link = document.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = href;
}

export function applyStoreBrandFromSettings(settings) {
  return {
    storeLogo: resolveStoreLogoUrl(settings?.general?.logo),
    storeFavicon: resolveStoreFaviconUrl(settings?.general?.favicon),
  };
}
