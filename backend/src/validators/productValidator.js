import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

export const validateGetProducts = [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors
];

export const validateProductId = [
  param('id').isUUID(),
  handleValidationErrors
];

export const validateCreateProduct = [
  body('name').isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  handleValidationErrors
];

export const validateUpdateProduct = [
  param('id').isUUID(),
  body('name').optional().isString().notEmpty().trim(),
  body('description').optional().isString(),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive', 'archived']),
  handleValidationErrors
];

export const validateUpdateBundles = [
  param('id').isUUID(),
  body('bundle_ids').isArray(),
  handleValidationErrors
];
