import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

export const validateUpdateCategory = [
  param('id').isUUID(),
  body('name').optional().isString().trim().notEmpty(),
  body('image_url').optional().isString().trim().notEmpty(),
  handleValidationErrors
];
