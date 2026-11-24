import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/category-showcase
 * Public endpoint - Get all category showcase settings
 */
router.get('/', async (req, res) => {
  try {
    console.log('Fetching category showcases...');
    
    const { data, error } = await supabase
      .from('category_showcase')
      .select(`
        id,
        category,
        product_id,
        products (
          id,
          name,
          price,
          images,
          category
        ),
        created_at,
        updated_at
      `);

    if (error) {
      console.error('Supabase error fetching category showcases:', error);
      throw error;
    }

    console.log('Category showcases fetched successfully:', data);

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching category showcases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category showcases',
      details: error.message
    });
  }
});

/**
 * GET /api/category-showcase/:category
 * Public endpoint - Get showcase setting for specific category
 */
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const { data, error } = await supabase
      .from('category_showcase')
      .select(`
        id,
        category,
        product_id,
        products (
          id,
          name,
          price,
          images,
          category
        ),
        created_at,
        updated_at
      `)
      .eq('category', category)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    res.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Error fetching category showcase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category showcase'
    });
  }
});

/**
 * POST /api/category-showcase
 * Admin only - Set or update showcase product for a category
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category, product_id } = req.body;

    // Validate input
    if (!category || !product_id) {
      return res.status(400).json({
        success: false,
        error: 'Category and product_id are required'
      });
    }

    // Verify product exists and belongs to the category
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, category')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Upsert category showcase (insert or update if exists)
    const { data, error } = await supabase
      .from('category_showcase')
      .upsert({
        category,
        product_id
      }, {
        onConflict: 'category'
      })
      .select(`
        id,
        category,
        product_id,
        products (
          id,
          name,
          price,
          images,
          category
        )
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `Category showcase updated for ${category}`,
      data
    });
  } catch (error) {
    console.error('Error setting category showcase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set category showcase'
    });
  }
});

/**
 * DELETE /api/category-showcase/:category
 * Admin only - Remove showcase override for a category (revert to automatic)
 */
router.delete('/:category', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category } = req.params;

    const { error } = await supabase
      .from('category_showcase')
      .delete()
      .eq('category', category);

    if (error) throw error;

    res.json({
      success: true,
      message: `Category showcase removed for ${category}, reverted to automatic`
    });
  } catch (error) {
    console.error('Error removing category showcase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove category showcase'
    });
  }
});

export default router;
