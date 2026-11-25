import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/subcategories  — public, optionally filter by category_id or category_slug
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category_id, category_slug, active_only = 'true' } = req.query;

    let query = supabase
      .from('subcategories')
      .select(`
        id, name, slug, description, image_url, sort_order, is_active,
        seo_title, seo_description, created_at,
        category:categories(id, name, slug, image_url)
      `)
      .order('sort_order', { ascending: true });

    if (active_only === 'true') {
      query = query.eq('is_active', true);
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (category_slug) {
      // Join through categories — filter by category slug
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category_slug)
        .single();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('GET /subcategories error:', err);
    res.status(500).json({ error: 'Failed to fetch subcategories', message: err.message });
  }
});

// ── GET /api/subcategories/:slug  — public, fetch single subcategory with its banner
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        id, name, slug, description, image_url, sort_order, is_active,
        seo_title, seo_description, created_at,
        category:categories(id, name, slug, image_url),
        banners:subcategory_banners(
          id, desktop_image_url, mobile_image_url, heading, subheading,
          cta_text, cta_link, is_active, sort_order
        )
      `)
      .eq('slug', slug)
      .order('sort_order', { referencedTable: 'subcategory_banners', ascending: true })
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Subcategory not found' });
      throw error;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /subcategories/:slug error:', err);
    res.status(500).json({ error: 'Failed to fetch subcategory', message: err.message });
  }
});

// ── POST /api/subcategories  — admin only
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      category_id, name, slug, description, image_url,
      sort_order = 0, is_active = true, seo_title, seo_description
    } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ error: 'category_id and name are required' });
    }

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        category_id, name: name.trim(), slug: autoSlug,
        description: description || null,
        image_url: image_url || null,
        sort_order: parseInt(sort_order) || 0,
        is_active: is_active !== false,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data, message: 'Subcategory created' });
  } catch (err) {
    console.error('POST /subcategories error:', err);
    res.status(500).json({ error: 'Failed to create subcategory', message: err.message });
  }
});

// ── PUT /api/subcategories/:id  — admin only
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.name && !updates.slug) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const { data, error } = await supabase
      .from('subcategories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data, message: 'Subcategory updated' });
  } catch (err) {
    console.error('PUT /subcategories/:id error:', err);
    res.status(500).json({ error: 'Failed to update subcategory', message: err.message });
  }
});

// ── DELETE /api/subcategories/:id  — admin only (checks for products)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if products are assigned to this subcategory
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('subcategory_id', id);

    if (count > 0) {
      return res.status(409).json({
        error: 'Cannot delete subcategory',
        message: `${count} product(s) are assigned to this subcategory. Reassign them first.`,
        product_count: count,
      });
    }

    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (err) {
    console.error('DELETE /subcategories/:id error:', err);
    res.status(500).json({ error: 'Failed to delete subcategory', message: err.message });
  }
});

// ─────────────────── BANNER ENDPOINTS ───────────────────

// ── GET /api/subcategories/:id/banners
router.get('/:id/banners', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subcategory_banners')
      .select('*')
      .eq('subcategory_id', req.params.id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banners', message: err.message });
  }
});

// ── POST /api/subcategories/:id/banners  — admin only
router.post('/:id/banners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subcategory_id = req.params.id;
    const {
      desktop_image_url, mobile_image_url,
      heading, subheading, cta_text, cta_link,
      is_active = true, sort_order = 0
    } = req.body;

    const { data, error } = await supabase
      .from('subcategory_banners')
      .insert({
        subcategory_id,
        desktop_image_url: desktop_image_url || null,
        mobile_image_url: mobile_image_url || null,
        heading: heading || null,
        subheading: subheading || null,
        cta_text: cta_text || null,
        cta_link: cta_link || null,
        is_active: is_active !== false,
        sort_order: parseInt(sort_order) || 0,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data, message: 'Banner created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create banner', message: err.message });
  }
});

// ── PUT /api/subcategories/:id/banners/:bannerId  — admin only
router.put('/:id/banners/:bannerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('subcategory_banners')
      .update(updates)
      .eq('id', req.params.bannerId)
      .eq('subcategory_id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data, message: 'Banner updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update banner', message: err.message });
  }
});

// ── DELETE /api/subcategories/:id/banners/:bannerId  — admin only
router.delete('/:id/banners/:bannerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('subcategory_banners')
      .delete()
      .eq('id', req.params.bannerId)
      .eq('subcategory_id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete banner', message: err.message });
  }
});

export default router;
