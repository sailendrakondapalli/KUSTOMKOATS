import * as productService from '../services/productService.js';

/**
 * Get all products (public)
 */
export async function getProducts(req, res) {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    const result = await productService.fetchProducts({ 
      category, 
      search, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    });

    res.json({ 
      data: result.products, 
      total: result.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products', 
      message: error.message 
    });
  }
}

/**
 * Get single product by ID (public)
 */
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await productService.fetchProduct(id);

    res.json({ data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ 
      error: 'Failed to fetch product', 
      message: error.message 
    });
  }
}

/**
 * Create product (admin only)
 */
export async function createProduct(req, res) {
  try {
    const productData = req.body;
    const product = await productService.createNewProduct(productData, req.user.id);

    res.status(201).json({ 
      success: true, 
      data: product,
      message: 'Product created successfully' 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      error: 'Failed to create product', 
      message: error.message 
    });
  }
}

/**
 * Update product (admin only)
 */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await productService.updateExistingProduct(id, updates);

    res.json({ 
      success: true, 
      data: product,
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ 
      error: 'Failed to update product', 
      message: error.message 
    });
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await productService.removeProduct(id);

    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(500).json({ 
      error: 'Failed to delete product', 
      message: error.message 
    });
  }
}

/**
 * Get product bundles (public)
 */
export async function getProductBundles(req, res) {
  try {
    const { id } = req.params;
    const bundles = await productService.fetchProductBundles(id);

    res.json({ data: bundles });
  } catch (error) {
    console.error('Error fetching product bundles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product bundles', 
      message: error.message 
    });
  }
}

/**
 * Update product bundles (admin only)
 */
export async function updateProductBundles(req, res) {
  try {
    const { id } = req.params;
    const { bundle_ids } = req.body;

    await productService.updateBundles(id, bundle_ids);

    res.json({ 
      success: true,
      message: 'Product bundles updated successfully'
    });
  } catch (error) {
    console.error('Error updating product bundles:', error);
    res.status(500).json({ 
      error: 'Failed to update product bundles', 
      message: error.message 
    });
  }
}
