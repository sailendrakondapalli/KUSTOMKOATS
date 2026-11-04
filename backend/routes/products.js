import express from 'express';
import { body, param, query } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get all products (public)
router.get('/', 
  optionalAuth,
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { category, search, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('products')
        .select('id, name, description, price, category, stock, images, custom_id', { count: 'exact' })
        .ilike('status', 'active')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.json({ 
        data, 
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        error: 'Failed to fetch products', 
        message: error.message 
      });
    }
  }
);

// Get single product by ID (public)
router.get('/:id',
  optionalAuth,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, category, stock, images, custom_id, technical_details')
        .eq('id', id)
        .ilike('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Product not found' 
          });
        }
        throw error;
      }

      res.json({ data });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        error: 'Failed to fetch product', 
        message: error.message 
      });
    }
  }
);

// Create product (admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  body('name').isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const productData = req.body;

      const { data, error } = await supabase
        .from('products')
        .insert([{ 
          ...productData,
          status: 'active',
          created_by: req.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Product created successfully' 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        error: 'Failed to create product', 
        message: error.message 
      });
    }
  }
);

// Update product (admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('name').optional().isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive', 'archived']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

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
          return res.status(404).json({ 
            error: 'Product not found' 
          });
        }
        throw error;
      }

      res.json({ 
        success: true, 
        data,
        message: 'Product updated successfully' 
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        error: 'Failed to update product', 
        message: error.message 
      });
    }
  }
);

// Delete product (admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Soft delete - set status to archived
      const { data, error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Product not found' 
          });
        }
        throw error;
      }

      res.json({ 
        success: true, 
        message: 'Product deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        error: 'Failed to delete product', 
        message: error.message 
      });
    }
  }
);

export default router;
