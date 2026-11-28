import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

export const validateAddToCart = [
  body('product_id').isUUID(),
  body('quantity').isInt({ min: 1 }),
  handleValidationErrors
];

export const validateUpdateCartItem = [
  param('id').isUUID(),
  body('quantity').isInt({ min: 0 }),
  handleValidationErrors
];

export const validateCartItemId = [
  param('id').isUUID(),
  handleValidationErrors
];
