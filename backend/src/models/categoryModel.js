import { supabase } from '../config/supabase.js';

/**
 * Get all categories ordered by sort_order
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Update category by ID
 */
export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}
