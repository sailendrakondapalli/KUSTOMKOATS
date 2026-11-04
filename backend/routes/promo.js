import express from 'express';
import { body, param } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validate promo code
router.post('/validate',
  body('code').isString().notEmpty(),
  body('cart_total').optional().isNumeric(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, cart_total } = req.body;

      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return res.status(404).json({ 
          success: false,
          error: 'Invalid promo code' 
        });
      }

      // Check date validity
      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = new Date(data.valid_until);

      if (now < validFrom) {
        return res.status(400).json({ 
          success: false,
          error: 'Promo code not yet valid' 
        });
      }

      if (now > validUntil) {
        return res.status(400).json({ 
          success: false,
          error: 'Promo code has expired' 
        });
      }

      // Check usage limit
      if (data.max_uses && data.uses >= data.max_uses) {
        return res.status(400).json({ 
          success: false,
          error: 'Promo code usage limit reached' 
        });
      }

      // Check minimum order value
      if (data.min_order_value && cart_total < data.min_order_value) {
        return res.status(400).json({ 
          success: false,
          error: `Minimum order value of ₹${data.min_order_value} required` 
        });
      }

      // Calculate discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = (cart_total * data.discount_value) / 100;
        if (data.max_discount_amount) {
          discount = Math.min(discount, data.max_discount_amount);
        }
      } else {
        discount = data.discount_value;
      }

      res.json({ 
        success: true, 
        data: {
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          discount_amount: discount,
          description: data.description
        }
      });
    } catch (error) {
      console.error('Error validating promo code:', error);
      res.status(500).json({ 
        error: 'Failed to validate promo code', 
        message: error.message 
      });
    }
  }
);

// Get all promo codes (admin only)
router.get('/',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      res.status(500).json({ 
        error: 'Failed to fetch promo codes', 
        message: error.message 
      });
    }
  }
);

// Create promo code (admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  body('code').isString().notEmpty().toUpperCase(),
  body('discount_type').isIn(['percentage', 'fixed']),
  body('discount_value').isNumeric(),
  body('valid_from').isISO8601(),
  body('valid_until').isISO8601(),
  body('max_uses').optional().isInt({ min: 1 }),
  body('min_order_value').optional().isNumeric(),
  body('max_discount_amount').optional().isNumeric(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const promoData = req.body;

      const { data, error } = await supabase
        .from('promo_codes')
        .insert([{
          ...promoData,
          is_active: true,
          uses: 0
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Promo code created successfully' 
      });
    } catch (error) {
      console.error('Error creating promo code:', error);
      res.status(500).json({ 
        error: 'Failed to create promo code', 
        message: error.message 
      });
    }
  }
);

// Update promo code (admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Promo code updated successfully' 
      });
    } catch (error) {
      console.error('Error updating promo code:', error);
      res.status(500).json({ 
        error: 'Failed to update promo code', 
        message: error.message 
      });
    }
  }
);

// Delete promo code (admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Promo code deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting promo code:', error);
      res.status(500).json({ 
        error: 'Failed to delete promo code', 
        message: error.message 
      });
    }
  }
);

export default router;
