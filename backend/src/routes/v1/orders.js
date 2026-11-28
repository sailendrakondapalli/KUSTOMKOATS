import express from 'express';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';
import { authenticateToken, requireAdmin } from '../../middleware/auth.js';
import { OrderService } from '../../services/orderService.js';
import { sendOrderConfirmationEmail } from '../../services/emailService.js';

const router = express.Router();

// GET /v1/orders/my-orders
router.get('/my-orders',
  authenticateToken,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const result = await OrderService.listForUser(req.user.id, { limit: +limit, offset: +offset });
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }
);

// GET /v1/orders  (admin)
router.get('/',
  authenticateToken, requireAdmin,
  query('status').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;
      const result = await OrderService.listAll({ status }, { limit: +limit, offset: +offset }, req.user);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }
);

// GET /v1/orders/:order_id
router.get('/:order_id',
  authenticateToken,
  param('order_id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const order = await OrderService.get(req.params.order_id, req.user);
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  }
);

// POST /v1/orders
router.post('/',
  authenticateToken,
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isNumeric(),
  body('shipping_address').notEmpty(),
  body('payment_method').optional().isString(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { items, shipping_address, payment_method, promo_code } = req.body;
      const order = await OrderService.create({
        userId: req.user.id,
        items,
        shippingAddress: shipping_address,
        paymentMethod: payment_method,
        promoCode: promo_code,
      });

      // Send confirmation email (non-blocking)
      const name = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Customer';
      sendOrderConfirmationEmail({
        name,
        email: req.user.email,
        orderId: order.display_order_id || order.id.slice(0, 8).toUpperCase(),
        items,
        total: order.total_amount,
        address: typeof shipping_address === 'string' ? shipping_address : Object.values(shipping_address).filter(Boolean).join(', '),
      }).catch(e => console.error('Order email error:', e.message));

      res.status(201).json({ success: true, data: order, message: 'Order created' });
    } catch (err) { next(err); }
  }
);

// PATCH /v1/orders/:order_id/status  (admin)
router.patch('/:order_id/status',
  authenticateToken, requireAdmin,
  param('order_id').isUUID(),
  body('status').isString().notEmpty(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const order = await OrderService.updateStatus(req.params.order_id, req.body.status, req.user);
      res.json({ success: true, data: order, message: 'Status updated' });
    } catch (err) { next(err); }
  }
);

export default router;
