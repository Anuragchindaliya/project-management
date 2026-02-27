/**
 * Central API client with axios
 * Handles withCredentials: true for JWT cookies
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Important: sends cookies (JWT) with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sets the base URL for the API client.
 * Useful for mobile apps where the base URL might change based on the environment.
 * @param url The new base URL
 */
export const setBaseURL = (url: string) => {
  apiClient.defaults.baseURL = url;
};


/**
 * Sets the authorization token for the API client.
 * @param token The JWT token
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Request interceptor (can be used for adding auth tokens if needed)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any request modifications here if needed
    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login or handle auth error
        console.error('Unauthorized access');
      } else if (status === 403) {
        // Forbidden - insufficient permissions
        console.error('Forbidden: Insufficient permissions');
      } else if (status >= 500) {
        // Server error
        console.error('Server error:', data?.error || 'Internal server error');
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
