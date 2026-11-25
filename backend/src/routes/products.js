import express from 'express';
import * as productController from '../controllers/productController.js';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  validateGetProducts,
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateUpdateBundles
} from '../validators/productValidator.js';

const router = express.Router();

// Get all products (public)
router.get('/', 
  optionalAuth,
  validateGetProducts,
  productController.getProducts
);

// Get single product by ID (public)
router.get('/:id',
  optionalAuth,
  validateProductId,
  productController.getProduct
);

// Create product (admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  validateCreateProduct,
  productController.createProduct
);

// Update product (admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validateUpdateProduct,
  productController.updateProduct
);

// Delete product (admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateProductId,
  productController.deleteProduct
);

// Get product bundles (public)
router.get('/:id/bundles',
  optionalAuth,
  validateProductId,
  productController.getProductBundles
);

// Update product bundles (admin only)
router.put('/:id/bundles',
  authenticateToken,
  requireAdmin,
  validateUpdateBundles,
  productController.updateProductBundles
);

export default router;
