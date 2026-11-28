import express from 'express';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../../middleware/auth.js';
import { CategoryService } from '../../services/categoryService.js';

const router = express.Router();

// GET /v1/subcategories
router.get('/', optionalAuth,
  query('category_id').optional().isUUID(),
  query('category_slug').optional().isString(),
  query('active_only').optional().isBoolean(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { category_id, category_slug, active_only } = req.query;
      const data = await CategoryService.listSubcategories({
        categoryId: category_id,
        categorySlug: category_slug,
        activeOnly: active_only !== 'false',
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
);

// GET /v1/subcategories/:slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const data = await CategoryService.getSubcategoryBySlug(req.params.slug);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /v1/subcategories
router.post('/', authenticateToken, requireAdmin,
  body('category_id').isUUID(),
  body('name').isString().notEmpty().trim(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.createSubcategory(req.body, req.user);
      res.status(201).json({ success: true, data, message: 'Subcategory created' });
    } catch (err) { next(err); }
  }
);

// PUT /v1/subcategories/:id
router.put('/:id', authenticateToken, requireAdmin,
  param('id').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.updateSubcategory(req.params.id, req.body, req.user);
      res.json({ success: true, data, message: 'Subcategory updated' });
    } catch (err) { next(err); }
  }
);

// DELETE /v1/subcategories/:id
router.delete('/:id', authenticateToken, requireAdmin,
  param('id').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      await CategoryService.deleteSubcategory(req.params.id, req.user);
      res.json({ success: true, message: 'Subcategory deleted' });
    } catch (err) { next(err); }
  }
);

// ── Subcategory Banners ──────────────────────────────────────────

router.get('/:id/banners', optionalAuth,
  param('id').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.listSubcategoryBanners(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
);

router.post('/:id/banners', authenticateToken, requireAdmin,
  param('id').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.createSubcategoryBanner(req.params.id, req.body, req.user);
      res.status(201).json({ success: true, data, message: 'Banner created' });
    } catch (err) { next(err); }
  }
);

router.put('/:id/banners/:bannerId', authenticateToken, requireAdmin,
  param('id').isUUID(), param('bannerId').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      const data = await CategoryService.updateSubcategoryBanner(
        req.params.id, req.params.bannerId, req.body, req.user
      );
      res.json({ success: true, data, message: 'Banner updated' });
    } catch (err) { next(err); }
  }
);

router.delete('/:id/banners/:bannerId', authenticateToken, requireAdmin,
  param('id').isUUID(), param('bannerId').isUUID(), handleValidationErrors,
  async (req, res, next) => {
    try {
      await CategoryService.deleteSubcategoryBanner(
        req.params.id, req.params.bannerId, req.user
      );
      res.json({ success: true, message: 'Banner deleted' });
    } catch (err) { next(err); }
  }
);

export default router;
