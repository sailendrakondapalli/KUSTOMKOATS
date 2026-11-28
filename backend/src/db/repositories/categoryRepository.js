import { supabase } from '../../config/supabase.js';

export const categoryRepository = {
  // ── Main Categories ─────────────────────────────────────────────

  async findAll(activeOnly = true) {
    let q = supabase
      .from('categories')
      .select('id, name, slug, description, image_url, sort_order, is_active')
      .order('sort_order', { ascending: true });
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findBySlug(slug) {
    const isUuid = slug.length === 36;
    let q = supabase
      .from('categories')
      .select(`
        id, name, slug, description, image_url, sort_order, is_active,
        subcategories(id, name, slug, description, image_url, sort_order, is_active)
      `)
      .order('sort_order', { referencedTable: 'subcategories', ascending: true });

    q = isUuid ? q.eq('id', slug) : q.eq('slug', slug);
    const { data, error } = await q.single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  async countSubcategories(categoryId) {
    const { count } = await supabase
      .from('subcategories')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);
    return count || 0;
  },

  // ── Category Banners ────────────────────────────────────────────

  async findBanners(categoryId) {
    const { data, error } = await supabase
      .from('category_banners')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createBanner(payload) {
    const { data, error } = await supabase
      .from('category_banners')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBanner(bannerId, categoryId, payload) {
    const { data, error } = await supabase
      .from('category_banners')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', bannerId)
      .eq('category_id', categoryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBanner(bannerId, categoryId) {
    const { error } = await supabase
      .from('category_banners')
      .delete()
      .eq('id', bannerId)
      .eq('category_id', categoryId);
    if (error) throw error;
  },

  // ── Subcategories ───────────────────────────────────────────────

  async findSubcategories({ categoryId, categorySlug, activeOnly = true } = {}) {
    let q = supabase
      .from('subcategories')
      .select(`
        id, name, slug, description, image_url, sort_order, is_active,
        seo_title, seo_description, created_at,
        category:categories(id, name, slug, image_url)
      `)
      .order('sort_order', { ascending: true });

    if (activeOnly) q = q.eq('is_active', true);
    if (categoryId) q = q.eq('category_id', categoryId);
    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', categorySlug).single();
      if (cat) q = q.eq('category_id', cat.id);
    }

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async findSubcategoryBySlug(slug) {
    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        id, name, slug, description, image_url, sort_order, is_active,
        seo_title, seo_description, created_at,
        category:categories(id, name, slug, image_url),
        banners:subcategory_banners(
          id, desktop_image_url, mobile_image_url,
          heading, subheading, cta_text, cta_link, is_active, sort_order
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async createSubcategory(payload) {
    const { data, error } = await supabase
      .from('subcategories')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSubcategory(id, payload) {
    const { data, error } = await supabase
      .from('subcategories')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSubcategory(id) {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
  },

  async countProductsInSubcategory(subcategoryId) {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('subcategory_id', subcategoryId);
    return count || 0;
  },

  async findSubcategoryBanners(subcategoryId) {
    const { data, error } = await supabase
      .from('subcategory_banners')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createSubcategoryBanner(payload) {
    const { data, error } = await supabase
      .from('subcategory_banners')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSubcategoryBanner(bannerId, subcategoryId, payload) {
    const { data, error } = await supabase
      .from('subcategory_banners')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', bannerId)
      .eq('subcategory_id', subcategoryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSubcategoryBanner(bannerId, subcategoryId) {
    const { error } = await supabase
      .from('subcategory_banners')
      .delete()
      .eq('id', bannerId)
      .eq('subcategory_id', subcategoryId);
    if (error) throw error;
  },
};
