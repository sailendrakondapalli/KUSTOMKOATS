import express from 'express';
import { body, param, query } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get product reviews (public)
router.get('/', 
  optionalAuth,
  query('product_id').optional().isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { product_id, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `, { count: 'exact' })
        .eq('is_approved', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Format response to include user info
      const formattedData = data.map(review => ({
        ...review,
        user_name: review.profiles?.full_name || 'Anonymous',
        user_email: review.profiles?.email
      }));

      res.json({ 
        success: true,
        data: formattedData, 
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ 
        error: 'Failed to fetch reviews', 
        message: error.message 
      });
    }
  }
);

// Submit review (authenticated)
router.post('/',
  authenticateToken,
  body('product_id').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').isString().notEmpty().trim().isLength({ max: 200 }),
  body('content').isString().notEmpty().trim().isLength({ min: 10, max: 2000 }),
  body('images').optional().isArray(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { product_id, rating, title, content, images } = req.body;
      const user_id = req.user.id;

      // Verify product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({ 
          error: 'Product not found' 
        });
      }

      // Check if user already reviewed this product
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', product_id)
        .eq('user_id', user_id)
        .single();

      if (existing) {
        return res.status(400).json({ 
          error: 'Already reviewed',
          message: 'You have already reviewed this product' 
        });
      }

      // Create review
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert([{ 
          product_id,
          user_id,
          rating,
          title,
          content,
          images: images || [],
          is_approved: true, // Auto-approve for now
          helpful_count: 0
        }])
        .select()
        .single();

      if (reviewError) throw reviewError;

      res.status(201).json({ 
        success: true, 
        data: review,
        message: 'Review submitted successfully' 
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ 
        error: 'Failed to submit review', 
        message: error.message 
      });
    }
  }
);

// Update review (authenticated, owner only)
router.put('/:id',
  authenticateToken,
  param('id').isUUID(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().isString().notEmpty().trim().isLength({ max: 200 }),
  body('content').optional().isString().notEmpty().trim().isLength({ min: 10, max: 2000 }),
  body('images').optional().isArray(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user_id = req.user.id;

      // Verify ownership
      const { data: review, error: checkError } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', id)
        .single();

      if (checkError || !review) {
        return res.status(404).json({ 
          error: 'Review not found' 
        });
      }

      if (review.user_id !== user_id) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only update your own reviews' 
        });
      }

      // Update review
      const { data: updated, error: updateError } = await supabase
        .from('reviews')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({ 
        success: true, 
        data: updated,
        message: 'Review updated successfully' 
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ 
        error: 'Failed to update review', 
        message: error.message 
      });
    }
  }
);

// Delete review (authenticated, owner or admin)
router.delete('/:id',
  authenticateToken,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Get review and user role
      const { data: review, error: checkError } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', id)
        .single();

      if (checkError || !review) {
        return res.status(404).json({ 
          error: 'Review not found' 
        });
      }

      // Check if user is owner
      const isOwner = review.user_id === user_id;

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user_id)
        .single();

      const isAdmin = profile?.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only delete your own reviews' 
        });
      }

      // Delete review
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.json({ 
        success: true, 
        message: 'Review deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ 
        error: 'Failed to delete review', 
        message: error.message 
      });
    }
  }
);

export default router;
