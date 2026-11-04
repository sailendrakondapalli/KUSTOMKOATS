import express from 'express';
import { body, param, query } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get user's orders
router.get('/my-orders',
  authenticateToken,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const { data, error, count } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .eq('user_id', req.user.id)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ 
        error: 'Failed to fetch orders', 
        message: error.message 
      });
    }
  }
);

// Get all orders (admin only)
router.get('/',
  authenticateToken,
  requireAdmin,
  query('status').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('orders')
        .select('*, order_items(*), profiles(email, full_name)', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ 
        error: 'Failed to fetch orders', 
        message: error.message 
      });
    }
  }
);

// Get single order
router.get('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Order not found' 
          });
        }
        throw error;
      }

      // Check if user owns this order or is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (data.user_id !== req.user.id && profile?.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'You do not have access to this order' 
        });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ 
        error: 'Failed to fetch order', 
        message: error.message 
      });
    }
  }
);

// Create order
router.post('/',
  authenticateToken,
  body('items').isArray().notEmpty(),
  body('items.*.product_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isNumeric(),
  body('shipping_address').isObject(),
  body('payment_method').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { items, shipping_address, payment_method, promo_code } = req.body;

      // Calculate total
      let total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Apply promo code if provided
      let discount = 0;
      if (promo_code) {
        const { data: promo, error: promoError } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', promo_code)
          .eq('is_active', true)
          .single();

        if (!promoError && promo) {
          // Check if promo is valid
          const now = new Date();
          const validFrom = new Date(promo.valid_from);
          const validUntil = new Date(promo.valid_until);

          if (now >= validFrom && now <= validUntil) {
            if (promo.discount_type === 'percentage') {
              discount = (total * promo.discount_value) / 100;
            } else {
              discount = promo.discount_value;
            }
          }
        }
      }

      const finalTotal = total - discount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: req.user.id,
          total: finalTotal,
          discount,
          shipping_address,
          payment_method,
          status: 'pending',
          promo_code: promo_code || null
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      res.status(201).json({ 
        success: true, 
        data: order,
        message: 'Order created successfully' 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'Failed to create order', 
        message: error.message 
      });
    }
  }
);

// Update order status (admin only)
router.patch('/:id/status',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Order not found' 
          });
        }
        throw error;
      }

      res.json({ 
        success: true, 
        data,
        message: 'Order status updated successfully' 
      });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ 
        error: 'Failed to update order', 
        message: error.message 
      });
    }
  }
);

export default router;
