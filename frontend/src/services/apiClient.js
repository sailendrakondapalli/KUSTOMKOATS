// API client for backend communication
// This replaces direct Supabase calls from the frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  try {
    const session = JSON.parse(localStorage.getItem('sb-gozoxlueuwnyujvvafdl-auth-token'));
    return session?.access_token;
  } catch {
    return null;
  }
};

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiCall(`/products/${id}`),
  
  create: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  update: (id, updates) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Cart API
export const cartAPI = {
  get: () => apiCall('/cart'),
  
  add: (product_id, quantity = 1) => apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity }),
  }),
  
  update: (id, quantity) => apiCall(`/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),
  
  remove: (id) => apiCall(`/cart/${id}`, {
    method: 'DELETE',
  }),
  
  clear: () => apiCall('/cart', {
    method: 'DELETE',
  }),
};

// Profile API
export const profileAPI = {
  get: () => apiCall('/profile'),
  
  update: (updates) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  getAddresses: () => apiCall('/profile/addresses'),
  
  addAddress: (addressData) => apiCall('/profile/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  }),
  
  updateAddress: (id, updates) => apiCall(`/profile/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  deleteAddress: (id) => apiCall(`/profile/addresses/${id}`, {
    method: 'DELETE',
  }),
};

// Auth API
export const authAPI = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  signup: (email, password, metadata = {}) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, metadata }),
  }),
  
  logout: () => apiCall('/auth/logout', {
    method: 'POST',
  }),
  
  resetPassword: (email) => apiCall('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  updatePassword: (newPassword) => apiCall('/auth/update-password', {
    method: 'PUT',
    body: JSON.stringify({ password: newPassword }),
  }),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  get: (id) => apiCall(`/orders/${id}`),
  
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  update: (id, updates) => apiCall(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
};

// Wholesale API
export const wholesaleAPI = {
  submit: (applicationData) => apiCall('/wholesale', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  
  getAll: () => apiCall('/wholesale'),
  
  get: (id) => apiCall(`/wholesale/${id}`),
  
  update: (id, updates) => apiCall(`/wholesale/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
};

// Promo API
export const promoAPI = {
  validate: (code) => apiCall(`/promo/validate?code=${encodeURIComponent(code)}`),
  
  apply: (code, orderTotal) => apiCall('/promo/apply', {
    method: 'POST',
    body: JSON.stringify({ code, orderTotal }),
  }),
};

// Storage/Upload API
export const storageAPI = {
  upload: (file, bucket = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    
    const token = getAuthToken();
    return fetch(`${API_BASE_URL}/storage/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  },
  
  getPublicUrl: (bucket, path) => 
    apiCall(`/storage/public-url?bucket=${bucket}&path=${encodeURIComponent(path)}`),
};

// Content API
export const contentAPI = {
  // Testimonials
  getTestimonials: (limit) => apiCall(`/content/testimonials${limit ? `?limit=${limit}` : ''}`),
  createTestimonial: (data) => apiCall('/content/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  updateTestimonial: (id, data) => apiCall(`/content/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTestimonial: (id) => apiCall(`/content/testimonials/${id}`, { method: 'DELETE' }),
  
  // FAQs
  getFAQs: () => apiCall('/content/faqs'),
  createFAQ: (data) => apiCall('/content/faqs', { method: 'POST', body: JSON.stringify(data) }),
  updateFAQ: (id, data) => apiCall(`/content/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFAQ: (id) => apiCall(`/content/faqs/${id}`, { method: 'DELETE' }),
  
  // Footer Links
  getFooterLinks: () => apiCall('/content/footer-links'),
  createFooterLink: (data) => apiCall('/content/footer-links', { method: 'POST', body: JSON.stringify(data) }),
  updateFooterLink: (id, data) => apiCall(`/content/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFooterLink: (id) => apiCall(`/content/footer-links/${id}`, { method: 'DELETE' }),
  
  // Policy Pages
  getPolicyPage: (slug) => apiCall(`/content/policy/${slug}`),
  getAllPolicyPages: () => apiCall('/content/policy'),
  updatePolicyPage: (slug, data) => apiCall(`/content/policy/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Blog Posts
  getBlogPosts: (limit) => apiCall(`/content/blog${limit ? `?limit=${limit}` : ''}`),
  getBlogPost: (slug) => apiCall(`/content/blog/${slug}`),
  createBlogPost: (data) => apiCall('/content/blog', { method: 'POST', body: JSON.stringify(data) }),
  updateBlogPost: (id, data) => apiCall(`/content/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogPost: (id) => apiCall(`/content/blog/${id}`, { method: 'DELETE' }),
  
  // Categories
  getCategories: () => apiCall('/content/categories'),
  
  // Settings
  getSetting: (key) => apiCall(`/content/settings/${key}`),
  updateSetting: (key, value) => apiCall(`/content/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
};

// Wishlist API
export const wishlistAPI = {
  get: () => apiCall('/wishlist'),
  
  add: (product_id) => apiCall('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id }),
  }),
  
  remove: (id) => apiCall(`/wishlist/${id}`, {
    method: 'DELETE',
  }),
  
  removeByProductId: (product_id) => apiCall(`/wishlist/product/${product_id}`, {
    method: 'DELETE',
  }),
};

// Export default client
export default {
  products: productsAPI,
  cart: cartAPI,
  profile: profileAPI,
  auth: authAPI,
  orders: ordersAPI,
  wholesale: wholesaleAPI,
  promo: promoAPI,
  storage: storageAPI,
  content: contentAPI,
  wishlist: wishlistAPI,
};
