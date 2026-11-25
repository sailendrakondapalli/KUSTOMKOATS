import { supabase } from '../config/supabase.js';

/**
 * Get products with filters and pagination
 */
export async function getProducts(filters, limit, offset) {
  let query = supabase
    .from('products')
    .select('id, name, description, price, category, stock, images, custom_id, status', { count: 'exact' })
    .eq('status', 'Active')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { products: data, count };
}

/**
 * Get single product by ID
 */
export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, category, stock, images, custom_id, technical_details')
    .eq('id', id)
    .eq('status', 'Active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Create a new product
 */
export async function createProduct(productData, userId) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ 
      ...productData,
      status: 'active',
      created_by: userId
    }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update a product
 */
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update({ 
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Delete (soft delete) a product
 */
export async function deleteProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get product bundles
 */
export async function getProductBundles(productId) {
  const { data, error } = await supabase
    .from('product_bundles')
    .select('bundle_id')
    .eq('product_id', productId);

  if (error) throw error;

  return data;
}

/**
 * Update product bundles
 */
export async function updateProductBundles(productId, bundleIds) {
  // Delete existing bundles
  await supabase
    .from('product_bundles')
    .delete()
    .eq('product_id', productId);

  // Insert new bundles
  if (bundleIds.length > 0) {
    const bundleTags = bundleIds.map(bundleId => ({
      product_id: productId,
      bundle_id: bundleId,
    }));

    const { error } = await supabase
      .from('product_bundles')
      .insert(bundleTags);

    if (error) throw error;
  }

  return true;
}
