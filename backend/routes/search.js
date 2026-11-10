import express from 'express';
import { query } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { optionalAuth } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Search products
router.get('/products', 
  optionalAuth,
  query('q').optional().isString().trim(),
  query('category').optional().isString(),
  query('min_price').optional().isNumeric(),
  query('max_price').optional().isNumeric(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { 
        q: searchTerm, 
        category, 
        min_price, 
        max_price, 
        limit = 50, 
        offset = 0 
      } = req.query;

      // Build query
      let query = supabase
        .from('products')
        .select('id, name, description, price, category, stock, images, custom_id', { count: 'exact' })
        .ilike('status', 'active')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      // Apply search term
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Apply price filters
      if (min_price) {
        query = query.gte('price', parseFloat(min_price));
      }
      if (max_price) {
        query = query.lte('price', parseFloat(max_price));
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get available categories for filtering
      const { data: categories } = await supabase
        .from('products')
        .select('category')
        .ilike('status', 'active')
        .not('category', 'is', null);

      const uniqueCategories = [...new Set(categories?.map(p => p.category).filter(Boolean))];

      // Get price range
      const { data: priceData } = await supabase
        .from('products')
        .select('price')
        .ilike('status', 'active')
        .not('price', 'is', null);

      const prices = priceData?.map(p => p.price) || [];
      const price_range = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices)
      } : { min: 0, max: 0 };

      res.json({ 
        success: true,
        data, 
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        filters: {
          categories: uniqueCategories,
          price_range
        }
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ 
        error: 'Search failed', 
        message: error.message 
      });
    }
  }
);

export default router;
