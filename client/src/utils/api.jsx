import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
    baseURL: apiBaseUrl,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
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

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Check if this is a public endpoint
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            originalRequest.url?.includes(endpoint)
        );
        
        // Don't try to refresh token for public endpoints
        if (isPublicEndpoint) {
            return Promise.reject(error);
        }
        
        // Only try to refresh once
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }
                
                const response = await apiClient.post("/api/auth/refresh-token", {
                    refreshToken: refreshToken
                });
                
                if (response.data.success) {
                    localStorage.setItem("token", response.data.data.accessToken);
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                
                // Don't redirect if already on auth pages
                const currentPath = window.location.pathname;
                if (!['/signIn', '/signUp', '/forgot-password', '/reset-password'].includes(currentPath)) {
                    window.location.href = "/signIn";
                }
            }
        }
        
        return Promise.reject(error);
    }
);

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