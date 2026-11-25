import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateUpdateCategory } from '../validators/categoryValidator.js';

const router = express.Router();

// Get all categories (public)
router.get('/', categoryController.getCategories);

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateUpdateCategory, categoryController.updateCategory);

export default router;
