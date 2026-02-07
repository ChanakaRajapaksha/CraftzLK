import axios from "axios";

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

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Public endpoints that don't need token refresh
const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/request-password-reset',
    '/api/auth/reset-password',
    '/api/auth/google',
    '/api/auth/refresh-token'
];

// Response interceptor to handle token refresh (cookie sent automatically)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            originalRequest.url?.includes(endpoint)
        );
        
        if (isPublicEndpoint) {
            return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const response = await apiClient.post("/api/auth/refresh-token");
                
                if (response.data.success && response.data.data?.accessToken) {
                    const accessToken = response.data.data.accessToken;
                    setAccessToken(accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                clearAccessToken();
                localStorage.removeItem("user");
                
                const currentPath = window.location.pathname;
                if (!['/signIn', '/signUp', '/forgot-password', '/reset-password'].includes(currentPath)) {
                    window.location.href = "/signIn";
                }
            }
        }
        
        return Promise.reject(error);
    }
);

/** Call refresh endpoint (cookie sent automatically); store new access token in memory. Returns true if session restored. */
export const restoreSession = async () => {
    try {
        const response = await apiClient.post("/api/auth/refresh-token");
        if (response.data?.success && response.data?.data?.accessToken) {
            setAccessToken(response.data.data.accessToken);
            return true;
        }
    } catch (_) {
        clearAccessToken();
    }
    return false;
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

export const postData = async (url, formData) => {
    try {
        const { data } = await apiClient.post(url, formData, {
            headers: { 'Content-Type': 'application/json' },
        });
        return data;
    } catch (error) {
        if (error.response) return error.response.data;
        throw error;
    }
}

export const editData = async (url, updatedData ) => {
    const { data } = await apiClient.put(url, updatedData);
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