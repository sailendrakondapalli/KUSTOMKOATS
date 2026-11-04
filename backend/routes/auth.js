import express from 'express';
import { body } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Register new user
router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').optional().isString().trim(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, full_name } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || ''
          }
        }
      });

      if (error) throw error;

      res.status(201).json({ 
        success: true, 
        data: {
          user: data.user,
          session: data.session
        },
        message: 'User registered successfully' 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        error: 'Registration failed', 
        message: error.message 
      });
    }
  }
);

// Login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        data: {
          user: data.user,
          session: data.session
        },
        message: 'Login successful' 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ 
        error: 'Login failed', 
        message: error.message 
      });
    }
  }
);

// Get current user profile
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        data: {
          ...req.user,
          profile: data
        }
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
router.put('/profile',
  authenticateToken,
  body('full_name').optional().isString().trim(),
  body('phone').optional().isString(),
  body('avatar_url').optional().isURL(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const updates = req.body;

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.user.id)
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

// Logout (invalidate session on client side)
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Logout successful' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed', 
        message: error.message 
      });
    }
  }
);

// Request password reset
router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Password reset email sent' 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ 
        error: 'Failed to send password reset email', 
        message: error.message 
      });
    }
  }
);

// Reset password
router.post('/reset-password',
  body('password').isLength({ min: 6 }),
  handleValidationErrors,
  authenticateToken,
  async (req, res) => {
    try {
      const { password } = req.body;

      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).json({ 
        error: 'Failed to update password', 
        message: error.message 
      });
    }
  }
);

export default router;
