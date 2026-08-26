import axios from "axios";
import { clearPersistedAuthUser } from "../store/authUser";
import { notifySessionExpired } from "./sessionEvents";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

// Access token: short-lived, in memory only; sent with every API request (Authorization: Bearer).
// Refresh token: in httpOnly cookie; browser sends it automatically; used only by refresh endpoint.
let accessTokenMemory = null;

export function setAccessToken(token) {
    accessTokenMemory = token || null;
}

export function getAccessToken() {
    return accessTokenMemory;
}

export function clearAccessToken() {
    accessTokenMemory = null;
}

// Public endpoints that don't need token refresh
const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/request-password-reset',
    '/api/auth/reset-password',
    '/api/auth/google',
    '/api/auth/refresh-token',
    '/api/coupons/validate',
];

const AUTH_PAGES = ['/signIn', '/signUp', '/forgot-password', '/reset-password', '/verifyOTP'];

const PROTECTED_APP_PATHS = [
  '/orders',
  '/my-account',
  '/my-list',
  '/changePassword',
  '/dashboard',
];

function normalizeRequestPath(url = '') {
  const raw = String(url || '');
  if (raw.startsWith('http')) {
    try {
      return new URL(raw).pathname;
    } catch {
      return raw.split('?')[0];
    }
  }
  return raw.split('?')[0];
}

function isPublicEndpoint(url = '') {
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
}

function isGuestBrowsableProductReviews(url = '') {
  const path = normalizeRequestPath(url);
  if (path === '/api/productReviews/stats') return true;
  if (path === '/api/productReviews/getall') return true;
  if (path !== '/api/productReviews') return false;

  const query = url.includes('?') ? url.split('?')[1] : '';
  if (!query) return false;

  try {
    return Boolean(new URLSearchParams(query).get('productId'));
  } catch {
    return query.includes('productId=');
  }
}

function isGuestBrowsableProductQuestions(url = '') {
  const path = normalizeRequestPath(url);
  if (path !== '/api/productQuestions') return false;

  const query = url.includes('?') ? url.split('?')[1] : '';
  if (!query) return false;

  try {
    return Boolean(new URLSearchParams(query).get('productId'));
  } catch {
    return query.includes('productId=');
  }
}

function isGuestBrowsableShippingMethods(url = '') {
  return normalizeRequestPath(url) === '/api/shipping-methods/active';
}

function isGuestBrowsableEndpoint(url = '') {
  const path = normalizeRequestPath(url);
  if (reqMethodIsGet(path, url) === false) return false;

  const exactPaths = new Set([
    '/api/banners',
    '/api/homeSideBanners',
    '/api/homeBottomBanners',
    '/api/homeBanner',
    '/api/homepage-content',
    '/api/search',
    '/api/category/active',
    '/api/settings',
  ]);

  if (exactPaths.has(path)) return true;
  if (path.startsWith('/api/search')) return true;
  if (path.startsWith('/api/products') && !path.startsWith('/api/products/admin')) return true;
  if (isGuestBrowsableProductReviews(url)) return true;
  if (isGuestBrowsableProductQuestions(url)) return true;
  if (isGuestBrowsableShippingMethods(url)) return true;
  if (path.startsWith('/api/artisans')) return true;
  if (path.startsWith('/api/cms-pages/public')) return true;

  if (path.startsWith('/api/category/')) {
    if (
      path.startsWith('/api/category/admin') ||
      path.includes('/get/count') ||
      path.includes('/subCat/get/count')
    ) {
      return false;
    }
    return path !== '/api/category';
  }

  return false;
}

function reqMethodIsGet(path, url) {
  if (url.includes(' ')) {
    return url.trim().toUpperCase().startsWith('GET ');
  }
  return true;
}

function shouldAttachAuth(url = '') {
  return !isPublicEndpoint(url) && !isGuestBrowsableEndpoint(url);
}

function shouldRedirectOnAuthFailure() {
  const currentPath = window.location.pathname;
  if (AUTH_PAGES.includes(currentPath)) return false;
  return PROTECTED_APP_PATHS.some(
    (prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`)
  );
}

let refreshTokenPromise = null;

async function refreshAccessToken() {
    if (!refreshTokenPromise) {
        refreshTokenPromise = apiClient.post("/api/auth/refresh-token")
            .then((response) => {
                if (response.data?.success && response.data?.data?.accessToken) {
                    setAccessToken(response.data.data.accessToken);
                    return true;
                }
                return false;
            })
            .catch(() => false)
            .finally(() => {
                refreshTokenPromise = null;
            });
    }
    return refreshTokenPromise;
}

async function ensureAccessToken() {
    if (getAccessToken()) return true;
    const restored = await restoreSession({ bypassCache: true });
    return restored === true;
}

function redirectToSignIn() {
    const currentPath = window.location.pathname;
    if (AUTH_PAGES.includes(currentPath)) return;
    const from = encodeURIComponent(currentPath);
    window.location.href = `/signIn?from=${from}`;
}

apiClient.interceptors.request.use(async (config) => {
    if (shouldAttachAuth(config.url)) {
        await ensureAccessToken();
    }

    const token = getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token refresh (cookie sent automatically)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || isPublicEndpoint(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (isGuestBrowsableEndpoint(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshed = await refreshAccessToken();
            if (refreshed) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
                return apiClient(originalRequest);
            }

            clearAccessToken();
            clearPersistedAuthUser();
            notifySessionExpired();
            if (shouldRedirectOnAuthFailure()) {
                redirectToSignIn();
            }
        }

        return Promise.reject(error);
    }
);

/** Call refresh endpoint (cookie sent automatically); store new access token in memory. Returns true/false, or null on transient errors. */
let restoreSessionInFlight = null;
let restoreSessionCache = null;
let restoreSessionCacheAt = 0;
const RESTORE_SESSION_CACHE_MS = 8000;

export function invalidateRestoreSessionCache() {
  restoreSessionCache = null;
  restoreSessionCacheAt = 0;
}

export const restoreSession = async ({ bypassCache = false } = {}) => {
  const now = Date.now();
  if (
    !bypassCache &&
    restoreSessionCache !== null &&
    now - restoreSessionCacheAt < RESTORE_SESSION_CACHE_MS
  ) {
    return restoreSessionCache;
  }

  if (restoreSessionInFlight) {
    return restoreSessionInFlight;
  }

  restoreSessionInFlight = (async () => {
    try {
      const response = await apiClient.post("/api/auth/refresh-token");
      if (response.data?.success && response.data?.data?.accessToken) {
        setAccessToken(response.data.data.accessToken);
        restoreSessionCache = true;
        restoreSessionCacheAt = Date.now();
        return true;
      }
      clearAccessToken();
      restoreSessionCache = false;
      restoreSessionCacheAt = Date.now();
      return false;
    } catch (error) {
      clearAccessToken();
      const status = error.response?.status;
      if (!error.response) {
        restoreSessionCache = null;
        restoreSessionCacheAt = Date.now();
        return null;
      }
      if (status === 401 || status === 403) {
        clearPersistedAuthUser();
        restoreSessionCache = false;
        restoreSessionCacheAt = Date.now();
        return false;
      }
      restoreSessionCache = null;
      restoreSessionCacheAt = Date.now();
      return null;
    } finally {
      restoreSessionInFlight = null;
    }
  })();

  return restoreSessionInFlight;
};

export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await apiClient.get(url);
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

function parseFilenameFromDisposition(disposition, fallbackFilename) {
  if (!disposition) return fallbackFilename;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      return utfMatch[1].trim();
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(disposition);
  return plainMatch?.[1]?.trim() || fallbackFilename;
}

/** Download a binary file (PDF/Excel) from an authenticated API endpoint. */
export const downloadFileFromApi = async (url, fallbackFilename = "download") => {
  try {
    const response = await apiClient.get(url, { responseType: "blob" });
    const contentType = response.headers["content-type"] || "application/octet-stream";
    const filename = parseFilenameFromDisposition(
      response.headers["content-disposition"],
      fallbackFilename
    );
    const blob = new Blob([response.data], { type: contentType });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
    return { success: true, filename };
  } catch (error) {
    let message = error.message || "Failed to download file.";
    const data = error.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (parsed?.message) message = parsed.message;
      } catch {
        /* keep default message */
      }
    } else if (data?.message) {
      message = data.message;
    }
    return { success: false, message };
  }
};

export function isApiSuccessResponse(res) {
    if (!res || typeof res !== "object") return false;
    if (res instanceof Error || res.isAxiosError || res.response) return false;
    if (res.success === false || res.status === false) return false;
    if (res.success === true) return true;
    return Boolean(res.id || res._id);
}

export const postData = async (url, formData) => {
    try {
        const { data } = await apiClient.post(url, formData, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: (status) => status >= 200 && status < 300,
        });
        return data;
    } catch (error) {
        if (error.response?.data) return error.response.data;
        return {
            success: false,
            message: error.message || "Network error. Please try again.",
        };
    }
}

export const editData = async (url, updatedData ) => {
    const { data } = await apiClient.put(url, updatedData);
    return data;
}

export const patchData = async (url, updatedData = {}) => {
    const { data } = await apiClient.patch(url, updatedData);
    return data;
}

export const deleteData = async (url ) => {
    const { data } = await apiClient.delete(url);
    return data;
}

export const uploadImage = async (url, formData) => {
    const { data } = await apiClient.post(url, formData);
    return data;
}

export const deleteImages = async (url,image ) => {
    const { data } = await apiClient.delete(url, { data: image });
    return data;
}