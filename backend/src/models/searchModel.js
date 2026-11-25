import { supabase } from '../config/supabase.js';

/**
 * Search products with filters and pagination
 */
export async function searchProducts(filters, limit, offset) {
  let query = supabase
    .from('products')
    .select('id, name, description, price, category, stock, images, custom_id, status', { count: 'exact' })
    .eq('status', 'Active')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  // Apply search term
  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  // Apply price filters
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { products: data, count };
}

/**
 * Get available categories from products
 */
export async function getAvailableCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'Active')
    .not('category', 'is', null);

  if (error) throw error;

  // Extract unique categories
  const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))];
  return uniqueCategories;
}

/**
 * Get price range from products
 */
export async function getPriceRange() {
  const { data, error } = await supabase
    .from('products')
    .select('price')
    .eq('status', 'Active')
    .not('price', 'is', null);

  if (error) throw error;

  const prices = data?.map(p => p.price) || [];
  
  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}
