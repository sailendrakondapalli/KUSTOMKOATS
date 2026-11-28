import { supabase } from '../../config/supabase.js';

const PRODUCT_PUBLIC_FIELDS =
  'id, name, description, price, original_price, category, subcategory, subcategory_id, stock, images, custom_id, status, is_featured, tags, size';

const PRODUCT_DETAIL_FIELDS =
  `${PRODUCT_PUBLIC_FIELDS}, technical_details, tech_details_title, tech_details_description, sku, brand, colour, finish, hsn_code, mrp, wholesale_price, dealer_price, display_product_id, barcode_type, internal_barcode, gtin_ean`;

export const productRepository = {
  /**
   * List active products with optional filters + pagination
   */
  async findAll({ category, subcategory_id, search, featured, limit = 50, offset = 0 } = {}) {
    let q = supabase
      .from('products')
      .select(PRODUCT_PUBLIC_FIELDS, { count: 'exact' })
      .eq('status', 'Active')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (category)       q = q.eq('category', category);
    if (subcategory_id) q = q.eq('subcategory_id', subcategory_id);
    if (featured)       q = q.eq('is_featured', true);
    if (search)         q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await q;
    if (error) throw error;
    return { products: data || [], count: count || 0 };
  },

  /**
   * Find a single active product by UUID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_DETAIL_FIELDS)
      .eq('id', id)
      .eq('status', 'Active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * Admin: find product by ID regardless of status
   */
  async findByIdAdmin(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /** Soft delete — sets status to 'archived' */
  async delete(id) {
    const { data, error } = await supabase
      .from('products')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getBundles(productId) {
    const { data, error } = await supabase
      .from('product_bundles')
      .select('bundle_id')
      .eq('product_id', productId);
    if (error) throw error;
    return data || [];
  },

  async replaceBundles(productId, bundleIds) {
    await supabase.from('product_bundles').delete().eq('product_id', productId);
    if (bundleIds.length > 0) {
      const { error } = await supabase.from('product_bundles').insert(
        bundleIds.map(id => ({ product_id: productId, bundle_id: id }))
      );
      if (error) throw error;
    }
  },
};
