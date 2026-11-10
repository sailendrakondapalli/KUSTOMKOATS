import express from 'express';
import { body, param, query } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get all bundles (public)
router.get('/', 
  optionalAuth,
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { category, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('bundles')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.json({ 
        success: true,
        data, 
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching bundles:', error);
      res.status(500).json({ 
        error: 'Failed to fetch bundles', 
        message: error.message 
      });
    }
  }
);

// Get single bundle with items (public)
router.get('/:id',
  optionalAuth,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch bundle
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (bundleError) {
        if (bundleError.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Bundle not found' 
          });
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

      res.json({ 
        success: true,
        data: bundle 
      });
    } catch (error) {
      console.error('Error fetching bundle:', error);
      res.status(500).json({ 
        error: 'Failed to fetch bundle', 
        message: error.message 
      });
    }
  }
);

// Create bundle (admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  body('name').isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('bundle_price').isNumeric().isFloat({ min: 0 }),
  body('discount').optional().isNumeric(),
  body('image_url').optional().isURL(),
  body('items').isArray().notEmpty(),
  body('items.*.product_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, description, bundle_price, discount, image_url, items } = req.body;

      // Verify all product IDs exist
      const productIds = items.map(item => item.product_id);
      const { data: products, error: verifyError } = await supabase
        .from('products')
        .select('id')
        .in('id', productIds);

      if (verifyError) throw verifyError;

      if (products.length !== productIds.length) {
        return res.status(400).json({ 
          error: 'Invalid product references',
          message: 'One or more product IDs do not exist' 
        });
      }

      // Create bundle
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert([{ 
          name,
          description,
          bundle_price,
          discount,
          image_url,
          is_active: true
        }])
        .select()
        .single();

      if (bundleError) throw bundleError;

      // Create bundle items
      const bundleItems = items.map(item => ({
        bundle_id: bundle.id,
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(bundleItems);

      if (itemsError) throw itemsError;

      res.status(201).json({ 
        success: true, 
        data: bundle,
        message: 'Bundle created successfully' 
      });
    } catch (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({ 
        error: 'Failed to create bundle', 
        message: error.message 
      });
    }
  }
);

// Update bundle (admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('name').optional().isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('bundle_price').optional().isNumeric().isFloat({ min: 0 }),
  body('discount').optional().isNumeric(),
  body('image_url').optional().isURL(),
  body('is_active').optional().isBoolean(),
  body('items').optional().isArray(),
  body('items.*.product_id').optional().isUUID(),
  body('items.*.quantity').optional().isInt({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { items, ...bundleUpdates } = req.body;

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
          return res.status(404).json({ 
            error: 'Bundle not found' 
          });
        }
        throw bundleError;
      }

      // Update items if provided
      if (items && items.length > 0) {
        // Verify product IDs
        const productIds = items.map(item => item.product_id);
        const { data: products, error: verifyError } = await supabase
          .from('products')
          .select('id')
          .in('id', productIds);

        if (verifyError) throw verifyError;

        if (products.length !== productIds.length) {
          return res.status(400).json({ 
            error: 'Invalid product references',
            message: 'One or more product IDs do not exist' 
          });
        }

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

      res.json({ 
        success: true, 
        data: bundle,
        message: 'Bundle updated successfully' 
      });
    } catch (error) {
      console.error('Error updating bundle:', error);
      res.status(500).json({ 
        error: 'Failed to update bundle', 
        message: error.message 
      });
    }
  }
);

// Delete bundle (admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Soft delete - set is_active to false
      const { data, error } = await supabase
        .from('bundles')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Bundle not found' 
          });
        }
        throw error;
      }

      res.json({ 
        success: true, 
        message: 'Bundle deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting bundle:', error);
      res.status(500).json({ 
        error: 'Failed to delete bundle', 
        message: error.message 
      });
    }
  }
);

export default router;
