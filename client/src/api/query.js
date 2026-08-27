/** Query-string helpers for building API URLs in controllers. */

export function buildQuery(params = {}) {
  if (params instanceof URLSearchParams) {
    const query = params.toString();
    return query ? `?${query}` : "";
  }
  if (typeof params === "string") {
    if (!params) return "";
    return params.startsWith("?") ? params : `?${params}`;
  }

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function withQuery(base, params) {
  return `${base}${buildQuery(params)}`;
}
