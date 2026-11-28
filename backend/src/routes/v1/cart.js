import express from 'express';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';
import { authenticateToken } from '../../middleware/auth.js';
import { CartService } from '../../services/cartService.js';

const router = express.Router();

// GET /v1/cart
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const cart = await CartService.get(req.user.id);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// POST /v1/cart
router.post('/',
  authenticateToken,
  body('product_id').isUUID(),
  body('quantity').optional().isInt({ min: 1 }),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await CartService.add(req.user.id, req.body.product_id, req.body.quantity || 1);
      res.status(201).json({ success: true, data: item, message: 'Added to cart' });
    } catch (err) { next(err); }
  }
);

// PUT /v1/cart/:cart_item_id
router.put('/:cart_item_id',
  authenticateToken,
  param('cart_item_id').isUUID(),
  body('quantity').isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await CartService.update(req.params.cart_item_id, req.user.id, req.body.quantity);
      res.json({ success: true, data: item });
    } catch (err) { next(err); }
  }
);

// DELETE /v1/cart/:cart_item_id
router.delete('/:cart_item_id',
  authenticateToken,
  param('cart_item_id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await CartService.remove(req.params.cart_item_id, req.user.id);
      res.json({ success: true, message: 'Item removed' });
    } catch (err) { next(err); }
  }
);

// DELETE /v1/cart  (clear all)
router.delete('/', authenticateToken, async (req, res, next) => {
  try {
    await CartService.clear(req.user.id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
});

export default router;
