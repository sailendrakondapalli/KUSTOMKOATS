import express from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { supabase } from '../config/supabase.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors, sanitizeBody } from '../middleware/validation.js';

const router = express.Router();

// Rate limiting for form submissions - 5 submissions per hour per IP
const formSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many submissions',
    message: 'You have exceeded the submission limit. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// ============= TESTIMONIALS =============

// Get all testimonials (public)
router.get('/testimonials',
  optionalAuth,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { limit } = req.query;
      
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const { data, error } = await query;
      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({ 
        error: 'Failed to fetch testimonials', 
        message: error.message 
      });
    }
  }
);

// Create testimonial (admin)
router.post('/testimonials',
  authenticateToken,
  requireAdmin,
  body('name').isString().notEmpty().trim(),
  body('content').isString().notEmpty().trim(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('image_url').optional().isString(),
  body('designation').optional().isString().trim(),
  body('is_active').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Testimonial created successfully' 
      });
    } catch (error) {
      console.error('Error creating testimonial:', error);
      res.status(500).json({ 
        error: 'Failed to create testimonial', 
        message: error.message 
      });
    }
  }
);

// Update testimonial (admin)
router.put('/testimonials/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('testimonials')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Testimonial updated successfully' 
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      res.status(500).json({ 
        error: 'Failed to update testimonial', 
        message: error.message 
      });
    }
  }
);

// Delete testimonial (admin)
router.delete('/testimonials/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Testimonial deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      res.status(500).json({ 
        error: 'Failed to delete testimonial', 
        message: error.message 
      });
    }
  }
);

// ============= FAQs =============

// Get all FAQs (public)
router.get('/faqs',
  optionalAuth,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch FAQs', 
        message: error.message 
      });
    }
  }
);

// Create FAQ (admin)
router.post('/faqs',
  authenticateToken,
  requireAdmin,
  body('question').isString().notEmpty().trim(),
  body('answer').isString().notEmpty().trim(),
  body('category').optional().isString().trim(),
  body('sort_order').optional().isInt(),
  body('is_active').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'FAQ created successfully' 
      });
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ 
        error: 'Failed to create FAQ', 
        message: error.message 
      });
    }
  }
);

// Update FAQ (admin)
router.put('/faqs/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('faqs')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'FAQ updated successfully' 
      });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ 
        error: 'Failed to update FAQ', 
        message: error.message 
      });
    }
  }
);

// Delete FAQ (admin)
router.delete('/faqs/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'FAQ deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ 
        error: 'Failed to delete FAQ', 
        message: error.message 
      });
    }
  }
);

// ============= FOOTER LINKS =============

// Get all footer links (public)
router.get('/footer-links',
  optionalAuth,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching footer links:', error);
      res.status(500).json({ 
        error: 'Failed to fetch footer links', 
        message: error.message 
      });
    }
  }
);

// Create footer link (admin)
router.post('/footer-links',
  authenticateToken,
  requireAdmin,
  body('title').isString().notEmpty().trim(),
  body('url').isString().notEmpty().trim(),
  body('category').optional().isString().trim(),
  body('sort_order').optional().isInt(),
  body('is_active').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Footer link created successfully' 
      });
    } catch (error) {
      console.error('Error creating footer link:', error);
      res.status(500).json({ 
        error: 'Failed to create footer link', 
        message: error.message 
      });
    }
  }
);

// Update footer link (admin)
router.put('/footer-links/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('footer_links')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Footer link updated successfully' 
      });
    } catch (error) {
      console.error('Error updating footer link:', error);
      res.status(500).json({ 
        error: 'Failed to update footer link', 
        message: error.message 
      });
    }
  }
);

// Delete footer link (admin)
router.delete('/footer-links/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('footer_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Footer link deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting footer link:', error);
      res.status(500).json({ 
        error: 'Failed to delete footer link', 
        message: error.message 
      });
    }
  }
);

// ============= POLICY PAGES =============

// Get policy page by slug (public)
router.get('/policy/:slug',
  optionalAuth,
  param('slug').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { data, error} = await supabase
        .from('policy_pages_content')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Policy page not found' 
        });
      }
      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching policy page:', error);
      res.status(500).json({ 
        error: 'Failed to fetch policy page', 
        message: error.message 
      });
    }
  }
);

// Get all policy pages (admin)
router.get('/policy',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('policy_pages_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching policy pages:', error);
      res.status(500).json({ 
        error: 'Failed to fetch policy pages', 
        message: error.message 
      });
    }
  }
);

// Update policy page (admin)
router.put('/policy/:slug',
  authenticateToken,
  requireAdmin,
  param('slug').isString(),
  body('title').optional().isString().trim(),
  body('content').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { data, error } = await supabase
        .from('policy_pages_content')
        .update(req.body)
        .eq('slug', slug)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Policy page updated successfully' 
      });
    } catch (error) {
      console.error('Error updating policy page:', error);
      res.status(500).json({ 
        error: 'Failed to update policy page', 
        message: error.message 
      });
    }
  }
);

// ============= BLOG POSTS =============

// Get all blog posts (public)
router.get('/blog',
  optionalAuth,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { limit } = req.query;
      
      let query = supabase
        .from('kustom_kultor_blog')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const { data, error } = await query;
      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch blog posts', 
        message: error.message 
      });
    }
  }
);

// Get single blog post by slug (public)
router.get('/blog/:slug',
  optionalAuth,
  param('slug').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { data, error } = await supabase
        .from('kustom_kultor_blog')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error && error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Blog post not found' 
        });
      }
      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ 
        error: 'Failed to fetch blog post', 
        message: error.message 
      });
    }
  }
);

// Create blog post (admin)
router.post('/blog',
  authenticateToken,
  requireAdmin,
  body('title').isString().notEmpty().trim(),
  body('slug').isString().notEmpty().trim(),
  body('content').isString().notEmpty(),
  body('excerpt').optional().isString().trim(),
  body('image_url').optional().isString(),
  body('author').optional().isString().trim(),
  body('is_published').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('kustom_kultor_blog')
        .insert([{
          ...req.body,
          published_at: req.body.is_published ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data,
        message: 'Blog post created successfully' 
      });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ 
        error: 'Failed to create blog post', 
        message: error.message 
      });
    }
  }
);

// Update blog post (admin)
router.put('/blog/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // Update published_at if changing is_published to true
      if (req.body.is_published) {
        updates.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('kustom_kultor_blog')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Blog post updated successfully' 
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ 
        error: 'Failed to update blog post', 
        message: error.message 
      });
    }
  }
);

// Delete blog post (admin)
router.delete('/blog/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('kustom_kultor_blog')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Blog post deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ 
        error: 'Failed to delete blog post', 
        message: error.message 
      });
    }
  }
);

// ============= CATEGORIES =============

// Get all categories (public)
router.get('/categories',
  optionalAuth,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      res.json({ success: true, data: data || [] });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ 
        error: 'Failed to fetch categories', 
        message: error.message 
      });
    }
  }
);

// ============= SETTINGS =============

// Get setting by key (public)
router.get('/settings/:key',
  optionalAuth,
  param('key').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { key } = req.params;
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Setting not found' 
        });
      }
      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ 
        error: 'Failed to fetch setting', 
        message: error.message 
      });
    }
  }
);

// Update setting (admin)
router.put('/settings/:key',
  authenticateToken,
  requireAdmin,
  param('key').isString(),
  body('value').exists(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const { data, error } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Setting updated successfully' 
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ 
        error: 'Failed to update setting', 
        message: error.message 
      });
    }
  }
);

// ============= CONTACT FORM =============

// Submit contact form (public with rate limiting)
router.post('/contact',
  formSubmissionLimiter,
  sanitizeBody,
  body('name').isString().notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
  body('subject').isString().notEmpty().trim().withMessage('Subject is required'),
  body('message').isString().notEmpty().trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      // Insert contact submission
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([{
          name,
          email,
          phone: phone || null,
          subject,
          message,
          status: 'new'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        message: 'Your message has been sent successfully. We will get back to you soon.',
        data: {
          id: data.id,
          created_at: data.created_at
        }
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ 
        error: 'Failed to submit contact form', 
        message: 'An error occurred while processing your submission. Please try again later.' 
      });
    }
  }
);

// ============= ENQUIRY FORM =============

// Submit enquiry form (public with rate limiting)
router.post('/enquiry',
  formSubmissionLimiter,
  sanitizeBody,
  body('name').isString().notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isString().notEmpty().trim().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Valid phone number is required'),
  body('product_id').optional().isUUID().withMessage('Invalid product ID'),
  body('message').isString().notEmpty().trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, phone, product_id, message } = req.body;

      // Validate product exists if product_id provided
      if (product_id) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('id', product_id)
          .single();

        if (productError && productError.code === 'PGRST116') {
          return res.status(400).json({ 
            error: 'Validation failed',
            message: 'The specified product does not exist' 
          });
        }
      }

      // Insert enquiry submission
      const { data, error } = await supabase
        .from('enquiry_submissions')
        .insert([{
          name,
          email,
          phone,
          product_id: product_id || null,
          message,
          status: 'new'
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        message: 'Your enquiry has been submitted successfully. We will contact you shortly.',
        data: {
          id: data.id,
          created_at: data.created_at
        }
      });
    } catch (error) {
      console.error('Error submitting enquiry form:', error);
      res.status(500).json({ 
        error: 'Failed to submit enquiry form', 
        message: 'An error occurred while processing your submission. Please try again later.' 
      });
    }
  }
);

// ============= ADMIN: MANAGE SUBMISSIONS =============

// Get all contact submissions (admin)
router.get('/contact-submissions',
  authenticateToken,
  requireAdmin,
  query('status').optional().isString().isIn(['new', 'in_progress', 'resolved', 'archived']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;
      
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      res.json({ 
        success: true, 
        data: data || [],
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch contact submissions', 
        message: error.message 
      });
    }
  }
);

// Get all enquiry submissions (admin)
router.get('/enquiry-submissions',
  authenticateToken,
  requireAdmin,
  query('status').optional().isString().isIn(['new', 'in_progress', 'resolved', 'archived']),
  query('product_id').optional().isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { status, product_id, limit = 50, offset = 0 } = req.query;
      
      let query = supabase
        .from('enquiry_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (product_id) {
        query = query.eq('product_id', product_id);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      res.json({ 
        success: true, 
        data: data || [],
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error fetching enquiry submissions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch enquiry submissions', 
        message: error.message 
      });
    }
  }
);

// Update contact submission status (admin)
router.patch('/contact-submissions/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('status').isString().isIn(['new', 'in_progress', 'resolved', 'archived']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabase
        .from('contact_submissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Contact submission status updated successfully' 
      });
    } catch (error) {
      console.error('Error updating contact submission:', error);
      res.status(500).json({ 
        error: 'Failed to update contact submission', 
        message: error.message 
      });
    }
  }
);

// Update enquiry submission status (admin)
router.patch('/enquiry-submissions/:id',
  authenticateToken,
  requireAdmin,
  param('id').isUUID(),
  body('status').isString().isIn(['new', 'in_progress', 'resolved', 'archived']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data, error } = await supabase
        .from('enquiry_submissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Enquiry submission status updated successfully' 
      });
    } catch (error) {
      console.error('Error updating enquiry submission:', error);
      res.status(500).json({ 
        error: 'Failed to update enquiry submission', 
        message: error.message 
      });
    }
  }
);

export default router;
