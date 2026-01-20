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

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const response = await apiClient.post("/api/auth/refresh-token", {
                        refreshToken: refreshToken
                    });
                    
                    if (response.data.success) {
                        localStorage.setItem("token", response.data.data.accessToken);
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                window.location.href = "/signIn";
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