import express from 'express';
import { body } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get user profile
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      res.json({ 
        success: true, 
        data: data || null 
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch profile', 
        message: error.message 
      });
    }
  }
);

// Update user profile
router.put('/',
  authenticateToken,
  body('full_name').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('avatar_url').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Profile updated successfully' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ 
        error: 'Failed to update profile', 
        message: error.message 
      });
    }
  }
);

// Get user addresses
router.get('/addresses',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      res.json({ 
        success: true, 
        data: data || [] 
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ 
        error: 'Failed to fetch addresses', 
        message: error.message 
      });
    }
  }
);

// Add address
router.post('/addresses',
  authenticateToken,
  body('line1').isString().notEmpty().trim(),
  body('line2').optional().isString().trim(),
  body('city').isString().notEmpty().trim(),
  body('state').isString().notEmpty().trim(),
  body('postal_code').isString().notEmpty().trim(),
  body('country').isString().notEmpty().trim(),
  body('phone').optional().isString().trim(),
  body('is_default').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const addressData = req.body;

      // If setting as default, unset other defaults
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({ 
          user_id: userId,
          ...addressData
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Address added successfully' 
      });
    } catch (error) {
      console.error('Error adding address:', error);
      res.status(500).json({ 
        error: 'Failed to add address', 
        message: error.message 
      });
    }
  }
);

// Update address
router.put('/addresses/:id',
  authenticateToken,
  body('line1').optional().isString().notEmpty().trim(),
  body('line2').optional().isString().trim(),
  body('city').optional().isString().notEmpty().trim(),
  body('state').optional().isString().notEmpty().trim(),
  body('postal_code').optional().isString().notEmpty().trim(),
  body('country').optional().isString().notEmpty().trim(),
  body('phone').optional().isString().trim(),
  body('is_default').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;

      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Address updated successfully' 
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ 
        error: 'Failed to update address', 
        message: error.message 
      });
    }
  }
);

// Delete address
router.delete('/addresses/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Address deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ 
        error: 'Failed to delete address', 
        message: error.message 
      });
    }
  }
);

export default router;
