import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword
} from '../validators/authValidator.js';

const router = express.Router();

// Register new user
router.post('/register', validateRegister, authController.register);

// Login
router.post('/login', validateLogin, authController.login);

// Get current user profile
router.get('/me', authenticateToken, authController.getMe);

// Update user profile
router.put('/profile', authenticateToken, validateUpdateProfile, authController.updateProfile);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Request password reset
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// Reset password
router.post('/reset-password', validateResetPassword, authenticateToken, authController.resetPassword);

export default router;
