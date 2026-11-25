import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

export const validateGetOrders = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors
];

export const validateGetAllOrders = [
  query('status').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors
];

export const validateOrderId = [
  param('id').isUUID(),
  handleValidationErrors
];

export const validateCreateOrder = [
  body('items').isArray().notEmpty(),
  body('items.*.product_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isNumeric(),
  body('shipping_address').isObject(),
  body('payment_method').isString(),
  handleValidationErrors
];

export const validateUpdateOrderStatus = [
  param('id').isUUID(),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  handleValidationErrors
];
