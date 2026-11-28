import { supabase } from '../config/supabase.js';

/**
 * Get bundles with filters and pagination
 */
export async function getBundles(filters, limit, offset) {
  let query = supabase
    .from('bundles')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { bundles: data, count };
}

/**
 * Get single bundle by ID with items and product details
 */
export async function getBundleById(id) {
  // Fetch bundle
  const { data: bundle, error: bundleError } = await supabase
    .from('bundles')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (bundleError) {
    if (bundleError.code === 'PGRST116') {
      return null;
    }
    throw bundleError;
  }

  // Fetch bundle items with product details
  const { data: items, error: itemsError } = await supabase
    .from('bundle_items')
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price,
        images,
        custom_id,
        stock
      )
    `)
    .eq('bundle_id', id);

  if (itemsError) throw itemsError;

  bundle.items = items || [];

  return bundle;
}

/**
 * Create a new bundle with items
 */
export async function createBundle(bundleData, items) {
  // Create bundle
  const { data: bundle, error: bundleError } = await supabase
    .from('bundles')
    .insert([{ 
      ...bundleData,
      is_active: true
    }])
    .select()
    .single();

  if (bundleError) throw bundleError;

  // Create bundle items if provided
  if (items && items.length > 0) {
    const bundleItems = items.map(item => ({
      bundle_id: bundle.id,
      product_id: item.product_id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('bundle_items')
      .insert(bundleItems);

    if (itemsError) throw itemsError;
  }

  return bundle;
}

/**
 * Update an existing bundle
 */
export async function updateBundle(id, bundleUpdates, items) {
  // Update bundle
  const { data: bundle, error: bundleError } = await supabase
    .from('bundles')
    .update({ 
      ...bundleUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (bundleError) {
    if (bundleError.code === 'PGRST116') {
      return null;
    }
    throw bundleError;
  }

  // Update items if provided
  if (items && items.length > 0) {
    // Delete existing items
    await supabase
      .from('bundle_items')
      .delete()
      .eq('bundle_id', id);

    // Insert new items
    const bundleItems = items.map(item => ({
      bundle_id: id,
      product_id: item.product_id,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('bundle_items')
      .insert(bundleItems);

    if (itemsError) throw itemsError;
  }

  return bundle;
}

/**
 * Delete (soft delete) a bundle
 */
export async function deleteBundle(id) {
  const { data, error } = await supabase
    .from('bundles')
    .update({ is_active: false })
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
 * Verify that all product IDs exist
 */
export async function verifyProductIds(productIds) {
  const { data: products, error } = await supabase
    .from('products')
    .select('id')
    .in('id', productIds);

  if (error) throw error;

  return products.length === productIds.length;
}
