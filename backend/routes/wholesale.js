import express from 'express';
import { body, param, query } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Submit wholesale application
router.post('/apply',
  body('business_name').isString().notEmpty().trim(),
  body('contact_person').isString().notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isString().notEmpty(),
  body('business_type').isString().notEmpty(),
  body('address').isString().notEmpty(),
  body('gst_number').optional().isString(),
  body('estimated_order_volume').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const applicationData = req.body;

      const { data, error } = await supabase
        .from('wholesale_applications')
        .insert([{
          ...applicationData,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Wholesale application submitted successfully' 
      });
    } catch (error) {
      console.error('Error submitting wholesale application:', error);
      res.status(500).json({ 
        error: 'Failed to submit application', 
        message: error.message 
      });
    }
  }
);

// Get all wholesale applications (admin only)
router.get('/applications',
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
        .from('wholesale_applications')
        .select('*', { count: 'exact' })
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
      console.error('Error fetching wholesale applications:', error);
      res.status(500).json({ 
        error: 'Failed to fetch applications', 
        message: error.message 
      });
    }
  }
);

// Update wholesale application status (admin only)
router.patch('/applications/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('status').isIn(['pending', 'approved', 'rejected']),
  body('notes').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const { data, error } = await supabase
        .from('wholesale_applications')
        .update({ 
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Application not found' 
          });
        }
        throw error;
      }

      res.json({ 
        success: true, 
        data,
        message: 'Application status updated successfully' 
      });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ 
        error: 'Failed to update application', 
        message: error.message 
      });
    }
  }
);

// Get wholesale customers (admin only)
router.get('/customers',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'wholesaler')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching wholesale customers:', error);
      res.status(500).json({ 
        error: 'Failed to fetch customers', 
        message: error.message 
      });
    }
  }
);

export default router;
