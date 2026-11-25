import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  validateAddToCart,
  validateUpdateCartItem,
  validateCartItemId
} from '../validators/cartValidator.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, cartController.getCart);

// Add item to cart
router.post('/', authenticateToken, validateAddToCart, cartController.addToCart);

// Update cart item quantity
router.put('/:id', authenticateToken, validateUpdateCartItem, cartController.updateCartItem);

// Remove item from cart
router.delete('/:id', authenticateToken, validateCartItemId, cartController.removeFromCart);

// Clear entire cart
router.delete('/', authenticateToken, cartController.clearCart);

export default router;
