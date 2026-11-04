import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;

        if (session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error('Session refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage, error.response?.data);

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default apiClient;

// API service functions

// Auth API
export const authAPI = {
  register: (email, password, full_name) => 
    apiClient.post('/auth/register', { email, password, full_name }),
  
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  getProfile: () => 
    apiClient.get('/auth/me'),
  
  updateProfile: (data) => 
    apiClient.put('/auth/profile', data),
  
  forgotPassword: (email) => 
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (password) => 
    apiClient.post('/auth/reset-password', { password })
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => 
    apiClient.get('/products', { params }),
  
  getById: (id) => 
    apiClient.get(`/products/${id}`),
  
  create: (data) => 
    apiClient.post('/products', data),
  
  update: (id, data) => 
    apiClient.put(`/products/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/products/${id}`)
};

// Orders API
export const ordersAPI = {
  getMyOrders: (params = {}) => 
    apiClient.get('/orders/my-orders', { params }),
  
  getAll: (params = {}) => 
    apiClient.get('/orders', { params }),
  
  getById: (id) => 
    apiClient.get(`/orders/${id}`),
  
  create: (data) => 
    apiClient.post('/orders', data),
  
  updateStatus: (id, status) => 
    apiClient.patch(`/orders/${id}/status`, { status })
};

// Promo Codes API
export const promoAPI = {
  validate: (code, cart_total) => 
    apiClient.post('/promo/validate', { code, cart_total }),
  
  getAll: () => 
    apiClient.get('/promo'),
  
  create: (data) => 
    apiClient.post('/promo', data),
  
  update: (id, data) => 
    apiClient.put(`/promo/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/promo/${id}`)
};

// Wholesale API
export const wholesaleAPI = {
  apply: (data) => 
    apiClient.post('/wholesale/apply', data),
  
  getApplications: (params = {}) => 
    apiClient.get('/wholesale/applications', { params }),
  
  updateApplication: (id, status, notes) => 
    apiClient.patch(`/wholesale/applications/${id}`, { status, notes }),
  
  getCustomers: () => 
    apiClient.get('/wholesale/customers')
};

// Storage API
export const storageAPI = {
  getUploadUrl: (bucket, path, contentType) => 
    apiClient.post('/storage/upload-url', { bucket, path, contentType }),
  
  getDownloadUrl: (bucket, path, expiresIn) => 
    apiClient.post('/storage/download-url', { bucket, path, expiresIn }),
  
  getPublicUrl: (bucket, path) => 
    apiClient.post('/storage/public-url', { bucket, path }),
  
  deleteFiles: (bucket, paths) => 
    apiClient.delete('/storage', { data: { bucket, paths } }),
  
  listFiles: (bucket, path = '') => 
    apiClient.get(`/storage/${bucket}`, { params: { path } })
};
