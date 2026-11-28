/**
 * v1 API Router — mounts all domain routers under /api/v1/
 *
 * Existing /api/* routes in server.js are preserved for backwards
 * compatibility with the React frontend until it is updated to /api/v1/*.
 */
import express from 'express';
import productsRouter     from './products.js';
import ordersRouter       from './orders.js';
import cartRouter         from './cart.js';
import categoriesRouter   from './categories.js';
import subcategoriesRouter from './subcategories.js';

const router = express.Router();

router.use('/products',      productsRouter);
router.use('/orders',        ordersRouter);
router.use('/cart',          cartRouter);
router.use('/categories',    categoriesRouter);
router.use('/subcategories', subcategoriesRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() });
});

export default router;
