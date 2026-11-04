import express from 'express';
import { query, param, body } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get all payment failures (admin only)
router.get('/',
  authenticateToken,
  requireAdmin,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('reviewed').optional().isBoolean(),
  query('error_code').optional().isString(),
  query('payment_method').optional().isString(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        reviewed, 
        error_code, 
        payment_method,
        start_date,
        end_date
      } = req.query;

      let query = supabase
        .from('payment_failures')
        .select(`
          *,
          orders (
            id,
            total_amount,
            order_status,
            display_order_id
          ),
          profiles!payment_failures_user_id_fkey (
            id,
            email,
            full_name
          )
        `, { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('failed_at', { ascending: false });

      // Apply filters
      if (reviewed !== undefined) {
        query = query.eq('reviewed', reviewed === 'true');
      }

      if (error_code) {
        query = query.eq('error_code', error_code);
      }

      if (payment_method) {
        query = query.eq('payment_method', payment_method);
      }

      if (start_date) {
        query = query.gte('failed_at', start_date);
      }

      if (end_date) {
        query = query.lte('failed_at', end_date);
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
      console.error('Error fetching payment failures:', error);
      res.status(500).json({ 
        error: 'Failed to fetch payment failures', 
        message: error.message 
      });
    }
  }
);

// Get payment failure statistics (admin only)
router.get('/stats',
  authenticateToken,
  requireAdmin,
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      let query = supabase
        .from('payment_failures')
        .select('error_code, error_reason, payment_method, amount');

      if (start_date) {
        query = query.gte('failed_at', start_date);
      }

      if (end_date) {
        query = query.lte('failed_at', end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total_failures: data.length,
        total_failed_amount: data.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0),
        by_error_code: {},
        by_error_reason: {},
        by_payment_method: {},
        average_failure_amount: 0
      };

      // Group by error code
      data.forEach(failure => {
        const code = failure.error_code || 'UNKNOWN';
        if (!stats.by_error_code[code]) {
          stats.by_error_code[code] = { count: 0, amount: 0 };
        }
        stats.by_error_code[code].count++;
        stats.by_error_code[code].amount += parseFloat(failure.amount) || 0;

        // Group by error reason
        const reason = failure.error_reason || 'unknown';
        if (!stats.by_error_reason[reason]) {
          stats.by_error_reason[reason] = { count: 0, amount: 0 };
        }
        stats.by_error_reason[reason].count++;
        stats.by_error_reason[reason].amount += parseFloat(failure.amount) || 0;

        // Group by payment method
        const method = failure.payment_method || 'unknown';
        if (!stats.by_payment_method[method]) {
          stats.by_payment_method[method] = { count: 0, amount: 0 };
        }
        stats.by_payment_method[method].count++;
        stats.by_payment_method[method].amount += parseFloat(failure.amount) || 0;
      });

      stats.average_failure_amount = stats.total_failures > 0 
        ? stats.total_failed_amount / stats.total_failures 
        : 0;

      res.json({ 
        success: true, 
        data: stats
      });
    } catch (error) {
      console.error('Error fetching payment failure stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch statistics', 
        message: error.message 
      });
    }
  }
);

// Get single payment failure (admin only)
router.get('/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('payment_failures')
        .select(`
          *,
          orders (
            id,
            total_amount,
            order_status,
            display_order_id,
            created_at
          ),
          profiles!payment_failures_user_id_fkey (
            id,
            email,
            full_name,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Payment failure record not found' 
          });
        }
        throw error;
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching payment failure:', error);
      res.status(500).json({ 
        error: 'Failed to fetch payment failure', 
        message: error.message 
      });
    }
  }
);

// Mark payment failure as reviewed (admin only)
router.patch('/:id/review',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('admin_notes').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { admin_notes } = req.body;

      const { data, error } = await supabase
        .from('payment_failures')
        .update({ 
          reviewed: true,
          reviewed_by: req.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: admin_notes || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Payment failure record not found' 
          });
        }
        throw error;
      }

      res.json({ 
        success: true, 
        data,
        message: 'Payment failure marked as reviewed' 
      });
    } catch (error) {
      console.error('Error updating payment failure:', error);
      res.status(500).json({ 
        error: 'Failed to update payment failure', 
        message: error.message 
      });
    }
  }
);

// Bulk mark as reviewed (admin only)
router.post('/bulk-review',
  authenticateToken,
  requireAdmin,
  body('ids').isArray(),
  body('ids.*').isUUID(),
  body('admin_notes').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { ids, admin_notes } = req.body;

      const { data, error } = await supabase
        .from('payment_failures')
        .update({ 
          reviewed: true,
          reviewed_by: req.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: admin_notes || null
        })
        .in('id', ids)
        .select();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: `${data.length} payment failures marked as reviewed` 
      });
    } catch (error) {
      console.error('Error bulk updating payment failures:', error);
      res.status(500).json({ 
        error: 'Failed to update payment failures', 
        message: error.message 
      });
    }
  }
);

export default router;
