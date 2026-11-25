import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').optional().isString().trim(),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

export const validateUpdateProfile = [
  body('full_name').optional().isString().trim(),
  body('phone').optional().isString(),
  body('avatar_url').optional().isURL(),
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors
];

export const validateResetPassword = [
  body('password').isLength({ min: 6 }),
  handleValidationErrors
];
