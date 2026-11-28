import express from 'express';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../../middleware/auth.js';
import { CategoryService } from '../../services/categoryService.js';

const router = express.Router();

// ── Main Categories ──────────────────────────────────────────────

// GET /v1/categories
router.get('/', optionalAuth,
  query('active_only').optional().isBoolean(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const activeOnly = req.query.active_only !== 'false';
      const data = await CategoryService.listCategories(activeOnly);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
);

// GET /v1/categories/:slug
router.get('/:slug', optionalAuth,
  async (req, res, next) => {
    try {
      const data = await CategoryService.getCategoryBySlug(req.params.slug);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
);

// POST /v1/categories
router.post('/', authenticateToken, requireAdmin,
  body('name').isString().notEmpty().trim(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.createCategory(req.body, req.user);
      res.status(201).json({ success: true, data, message: 'Category created' });
    } catch (err) { next(err); }
  }
);

// PUT /v1/categories/:id
router.put('/:id', authenticateToken, requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.updateCategory(req.params.id, req.body, req.user);
      res.json({ success: true, data, message: 'Category updated' });
    } catch (err) { next(err); }
  }
);

// DELETE /v1/categories/:id
router.delete('/:id', authenticateToken, requireAdmin,
  param('id').isUUID(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await CategoryService.deleteCategory(req.params.id, req.user);
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) { next(err); }
  }
);

// ── Category Banners ─────────────────────────────────────────────

router.get('/:id/banners', optionalAuth,
  param('id').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.listCategoryBanners(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
);

router.post('/:id/banners', authenticateToken, requireAdmin,
  param('id').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.createCategoryBanner(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, data, message: 'Banner created' });
    } catch (err) { next(err); }
  }
);

router.put('/:id/banners/:bannerId', authenticateToken, requireAdmin,
  param('id').isUUID(), param('bannerId').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.updateCategoryBanner(req.params.id, req.params.bannerId, req.body, req.user);
      res.json({ success: true, data, message: 'Banner updated' });
    } catch (err) { next(err); }
  }
);

router.delete('/:id/banners/:bannerId', authenticateToken, requireAdmin,
  param('id').isUUID(), param('bannerId').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      await CategoryService.deleteCategoryBanner(req.params.id, req.params.bannerId, req.user);
      res.json({ success: true, message: 'Banner deleted' });
    } catch (err) { next(err); }
  }
);

export default router;
