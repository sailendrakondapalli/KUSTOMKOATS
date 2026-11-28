import express from 'express';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../../middleware/auth.js';
import { ProductService } from '../../services/productService.js';

const router = express.Router();

// GET /v1/products
router.get('/',
  optionalAuth,
  query('category').optional().isString(),
  query('subcategory_id').optional().isUUID(),
  query('search').optional().isString(),
  query('featured').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { category, subcategory_id, search, featured, limit = 50, offset = 0 } = req.query;
      const result = await ProductService.list(
        { category, subcategory_id, search, featured: featured === 'true', limit: +limit, offset: +offset },
        req.user
      );
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }
);

// GET /v1/products/:product_id
router.get('/:product_id',
  optionalAuth,
  param('product_id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const product = await ProductService.get(req.params.product_id);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  }
);

// POST /v1/products
router.post('/',
  authenticateToken, requireAdmin,
  body('name').isString().notEmpty().trim(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const product = await ProductService.create(req.body, req.user);
      res.status(201).json({ success: true, data: product, message: 'Product created' });
    } catch (err) { next(err); }
  }
);

// PUT /v1/products/:product_id
router.put('/:product_id',
  authenticateToken, requireAdmin,
  param('product_id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const product = await ProductService.update(req.params.product_id, req.body, req.user);
      res.json({ success: true, data: product, message: 'Product updated' });
    } catch (err) { next(err); }
  }
);

// DELETE /v1/products/:product_id
router.delete('/:product_id',
  authenticateToken, requireAdmin,
  param('product_id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await ProductService.remove(req.params.product_id, req.user);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) { next(err); }
  }
);

// GET /v1/products/:product_id/bundles
router.get('/:product_id/bundles',
  optionalAuth,
  param('product_id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const bundles = await ProductService.getBundles(req.params.product_id);
      res.json({ success: true, data: bundles });
    } catch (err) { next(err); }
  }
);

// PUT /v1/products/:product_id/bundles
router.put('/:product_id/bundles',
  authenticateToken, requireAdmin,
  param('product_id').isUUID(),
  body('bundle_ids').isArray(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await ProductService.replaceBundles(req.params.product_id, req.body.bundle_ids, req.user);
      res.json({ success: true, message: 'Bundles updated' });
    } catch (err) { next(err); }
  }
);

export default router;
