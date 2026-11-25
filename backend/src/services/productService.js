import * as productModel from '../models/productModel.js';

/**
 * Fetch products with filters and pagination
 */
export async function fetchProducts({ category, search, limit, offset }) {
  const filters = {};
  if (category) filters.category = category;
  if (search) filters.search = search;

  console.log('📦 Fetching products with filters:', { category, search, limit, offset });

  const { products, count } = await productModel.getProducts(filters, limit, offset);

  console.log('✅ Products fetched:', { count, dataLength: products?.length });

  return { products, count };
}

/**
 * Fetch single product by ID
 */
export async function fetchProduct(id) {
  const product = await productModel.getProductById(id);

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

/**
 * Create a new product
 */
export async function createNewProduct(productData, userId) {
  const product = await productModel.createProduct(productData, userId);
  return product;
}

/**
 * Update an existing product
 */
export async function updateExistingProduct(id, updates) {
  const product = await productModel.updateProduct(id, updates);

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

/**
 * Delete a product
 */
export async function removeProduct(id) {
  const product = await productModel.deleteProduct(id);

  if (!product) {
    throw new Error('Product not found');
  }

  return true;
}

/**
 * Fetch product bundles
 */
export async function fetchProductBundles(productId) {
  const bundles = await productModel.getProductBundles(productId);
  return bundles;
}

/**
 * Update product bundles
 */
export async function updateBundles(productId, bundleIds) {
  await productModel.updateProductBundles(productId, bundleIds);
  return true;
}
