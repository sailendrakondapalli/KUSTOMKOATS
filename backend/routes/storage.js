import express from 'express';
import { body, param } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get signed URL for file upload (authenticated users)
router.post('/upload-url',
  authenticateToken,
  body('bucket').isString().notEmpty(),
  body('path').isString().notEmpty(),
  body('contentType').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bucket, path, contentType } = req.body;

      // Validate bucket name (security)
      const allowedBuckets = ['products', 'avatars', 'documents', 'invoices'];
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({ 
          error: 'Invalid bucket name' 
        });
      }

      // Generate signed URL for upload
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);

      if (error) throw error;

      res.json({ 
        success: true, 
        data: {
          signedUrl: data.signedUrl,
          path: data.path,
          token: data.token
        }
      });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      res.status(500).json({ 
        error: 'Failed to generate upload URL', 
        message: error.message 
      });
    }
  }
);

// Get signed URL for file download
router.post('/download-url',
  body('bucket').isString().notEmpty(),
  body('path').isString().notEmpty(),
  body('expiresIn').optional().isInt({ min: 60, max: 3600 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bucket, path, expiresIn = 3600 } = req.body;

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      res.json({ 
        success: true, 
        data: {
          signedUrl: data.signedUrl
        }
      });
    } catch (error) {
      console.error('Error generating download URL:', error);
      res.status(500).json({ 
        error: 'Failed to generate download URL', 
        message: error.message 
      });
    }
  }
);

// Get public URL for file
router.post('/public-url',
  body('bucket').isString().notEmpty(),
  body('path').isString().notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bucket, path } = req.body;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      res.json({ 
        success: true, 
        data: {
          publicUrl: data.publicUrl
        }
      });
    } catch (error) {
      console.error('Error generating public URL:', error);
      res.status(500).json({ 
        error: 'Failed to generate public URL', 
        message: error.message 
      });
    }
  }
);

// Delete file (admin only)
router.delete('/',
  authenticateToken,
  requireAdmin,
  body('bucket').isString().notEmpty(),
  body('paths').isArray().notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { bucket, paths } = req.body;

      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;

      res.json({ 
        success: true, 
        data,
        message: 'Files deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting files:', error);
      res.status(500).json({ 
        error: 'Failed to delete files', 
        message: error.message 
      });
    }
  }
);

// List files in bucket (admin only)
router.get('/:bucket',
  authenticateToken,
  requireAdmin,
  param('bucket').isString(),
  async (req, res) => {
    try {
      const { bucket } = req.params;
      const { path = '' } = req.query;

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) throw error;

      res.json({ 
        success: true, 
        data 
      });
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ 
        error: 'Failed to list files', 
        message: error.message 
      });
    }
  }
);

export default router;
