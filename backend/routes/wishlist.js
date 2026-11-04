import express from 'express';
import { body, param } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get user's wishlist
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ 
        error: 'Failed to fetch wishlist', 
        message: error.message 
      });
    }
  }
);

// Add item to wishlist
router.post('/',
  authenticateToken,
  body('product_id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ 
          error: 'Item already in wishlist' 
        });
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id })
        .select('*, products(*)')
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Item added to wishlist' 
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ 
        error: 'Failed to add to wishlist', 
        message: error.message 
      });
    }
  }
);

// Remove item from wishlist
router.delete('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Item removed from wishlist' 
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ 
        error: 'Failed to remove from wishlist', 
        message: error.message 
      });
    }
  }
);

// Remove by product_id (alternative endpoint)
router.delete('/product/:product_id',
  authenticateToken,
  param('product_id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id } = req.params;

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product_id);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Item removed from wishlist' 
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ 
        error: 'Failed to remove from wishlist', 
        message: error.message 
      });
    }
  }
);

export default router;
