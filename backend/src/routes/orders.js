import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  validateGetOrders,
  validateGetAllOrders,
  validateOrderId,
  validateCreateOrder,
  validateUpdateOrderStatus
} from '../validators/orderValidator.js';

const router = express.Router();

// Get user's orders
router.get('/my-orders', authenticateToken, validateGetOrders, orderController.getMyOrders);

// Get all orders (admin only)
router.get('/', authenticateToken, requireAdmin, validateGetAllOrders, orderController.getAllOrders);

// Get single order
router.get('/:id', authenticateToken, validateOrderId, orderController.getOrder);

// Create order
router.post('/', authenticateToken, validateCreateOrder, orderController.createOrder);

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, validateUpdateOrderStatus, orderController.updateOrderStatus);

export default router;
