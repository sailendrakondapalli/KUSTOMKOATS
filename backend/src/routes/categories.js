import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/categories  — public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { active_only = 'true' } = req.query;
    let q = supabase
      .from('categories')
      .select('id, name, slug, description, image_url, sort_order, is_active, created_at')
      .order('sort_order', { ascending: true });

    if (active_only === 'true') q = q.eq('is_active', true);

    const { data, error } = await q;
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories', message: err.message });
  }
});

// ── GET /api/categories/:slug  — public, includes subcategories
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    // Try matching by slug first, then by id
    let q = supabase
      .from('categories')
      .select(`
        id, name, slug, description, image_url, sort_order, is_active,
        subcategories(id, name, slug, description, image_url, sort_order, is_active)
      `)
      .order('sort_order', { referencedTable: 'subcategories', ascending: true });

    // UUIDs are 36 chars
    if (slug.length === 36) {
      q = q.eq('id', slug);
    } else {
      q = q.eq('slug', slug);
    }

    const { data, error } = await q.single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Category not found' });
      throw error;
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /categories/:slug error:', err);
    res.status(500).json({ error: 'Failed to fetch category', message: err.message });
  }
});

// ── POST /api/categories  — admin only
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, image_url, sort_order = 0, is_active = true } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug: autoSlug, description, image_url, sort_order, is_active })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data, message: 'Category created' });
  } catch (err) {
    console.error('POST /categories error:', err);
    res.status(500).json({ error: 'Failed to create category', message: err.message });
  }
});

// ── PUT /api/categories/:id  — admin only
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.name && !updates.slug) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    delete updates.id;

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data, message: 'Category updated' });
  } catch (err) {
    console.error('PUT /categories/:id error:', err);
    res.status(500).json({ error: 'Failed to update category', message: err.message });
  }
});

// ── DELETE /api/categories/:id  — admin only (checks for subcategories)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { count } = await supabase
      .from('subcategories')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count > 0) {
      return res.status(409).json({
        error: 'Cannot delete category',
        message: `${count} subcategorie(s) exist under this category. Delete them first.`,
      });
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /categories/:id error:', err);
    res.status(500).json({ error: 'Failed to delete category', message: err.message });
  }
});

// ─────────────────── BANNER ENDPOINTS FOR CATEGORIES ───────────────────

// ── GET /api/categories/:id/banners
router.get('/:id/banners', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('category_banners')
      .select('*')
      .eq('category_id', req.params.id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category banners', message: err.message });
  }
});

// ── POST /api/categories/:id/banners  — admin only
router.post('/:id/banners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category_id = req.params.id;
    const {
      desktop_image_url, mobile_image_url,
      heading, subheading, cta_text, cta_link,
      is_active = true, sort_order = 0
    } = req.body;

    const { data, error } = await supabase
      .from('category_banners')
      .insert({
        category_id,
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
    res.status(201).json({ success: true, data, message: 'Category banner created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category banner', message: err.message });
  }
});

// ── PUT /api/categories/:id/banners/:bannerId  — admin only
router.put('/:id/banners/:bannerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('category_banners')
      .update(updates)
      .eq('id', req.params.bannerId)
      .eq('category_id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data, message: 'Category banner updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category banner', message: err.message });
  }
});

// ── DELETE /api/categories/:id/banners/:bannerId  — admin only
router.delete('/:id/banners/:bannerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('category_banners')
      .delete()
      .eq('id', req.params.bannerId)
      .eq('category_id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Category banner deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category banner', message: err.message });
  }
});

export default router;
