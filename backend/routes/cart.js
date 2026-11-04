import express from 'express';
import { body, param } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get user's cart
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('cart')
        .select('id, product_id, quantity, products(id, name, price, images, custom_id)')
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ data: data || [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cart', 
        message: error.message 
      });
    }
  }
);

// Add item to cart
router.post('/',
  authenticateToken,
  body('product_id').isUUID(),
  body('quantity').isInt({ min: 1 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id, quantity } = req.body;

      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .maybeSingle();

      let result;
      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select('*, products(*)')
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart')
          .insert({ 
            user_id: userId, 
            product_id, 
            quantity 
          })
          .select('*, products(*)')
          .single();

        if (error) throw error;
        result = data;
      }

      res.status(201).json({ 
        success: true, 
        data: result,
        message: 'Item added to cart' 
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ 
        error: 'Failed to add item to cart', 
        message: error.message 
      });
    }
  }
);

// Update cart item quantity
router.put('/:id',
  authenticateToken,
  param('id').isUUID(),
  body('quantity').isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === 0) {
        // Delete if quantity is 0
        const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        res.json({ 
          success: true, 
          message: 'Item removed from cart' 
        });
      } else {
        // Update quantity
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity })
          .eq('id', id)
          .eq('user_id', userId)
          .select('*, products(*)')
          .single();

        if (error) throw error;

        res.json({ 
          success: true, 
          data,
          message: 'Cart updated' 
        });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ 
        error: 'Failed to update cart', 
        message: error.message 
      });
    }
  }
);

// Remove item from cart
router.delete('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Item removed from cart' 
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ 
        error: 'Failed to remove item', 
        message: error.message 
      });
    }
  }
);

// Clear entire cart
router.delete('/',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Cart cleared' 
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ 
        error: 'Failed to clear cart', 
        message: error.message 
      });
    }
  }
);

export default router;
