import api from './apiClient'

// Fetch products via backend API
export async function fetchProducts(filters = {}) {
  try {
    const response = await api.products.getAll(filters);
    return response.data || [];
  } catch (e) {
    console.error('fetchProducts failed:', e.message);
    return [];
  }
}

export async function fetchProductById(id) {
  try {
    const response = await api.products.getById(id);
    return response.data || null;
  } catch (e) {
    console.error('fetchProductById failed:', e.message);
    return null;
  }
}
