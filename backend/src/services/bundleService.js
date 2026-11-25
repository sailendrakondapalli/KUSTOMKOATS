import * as bundleModel from '../models/bundleModel.js';

/**
 * Fetch bundles with filters and pagination
 */
export async function fetchBundles({ category, limit, offset }) {
  const filters = {};
  if (category) filters.category = category;

  console.log('📦 Fetching bundles with filters:', { category, limit, offset });

  const { bundles, count } = await bundleModel.getBundles(filters, limit, offset);

  console.log('✅ Bundles fetched:', { count, dataLength: bundles?.length });

  return { bundles, count };
}

/**
 * Fetch single bundle by ID with items
 */
export async function fetchBundle(id) {
  const bundle = await bundleModel.getBundleById(id);

  if (!bundle) {
    throw new Error('Bundle not found');
  }

  return bundle;
}

/**
 * Create a new bundle with items
 */
export async function createNewBundle(bundleData, items) {
  // Validate product references if items provided
  if (items && items.length > 0) {
    const productIds = items.map(item => item.product_id);
    const allProductsExist = await bundleModel.verifyProductIds(productIds);

    if (!allProductsExist) {
      throw new Error('Invalid product references - one or more product IDs do not exist');
    }
  }

  const bundle = await bundleModel.createBundle(bundleData, items);
  return bundle;
}

/**
 * Update an existing bundle
 */
export async function updateExistingBundle(id, bundleUpdates, items) {
  // Validate product references if items provided
  if (items && items.length > 0) {
    const productIds = items.map(item => item.product_id);
    const allProductsExist = await bundleModel.verifyProductIds(productIds);

    if (!allProductsExist) {
      throw new Error('Invalid product references - one or more product IDs do not exist');
    }
  }

  const bundle = await bundleModel.updateBundle(id, bundleUpdates, items);

  if (!bundle) {
    throw new Error('Bundle not found');
  }

  return bundle;
}

/**
 * Delete a bundle
 */
export async function removeBundle(id) {
  const bundle = await bundleModel.deleteBundle(id);

  if (!bundle) {
    throw new Error('Bundle not found');
  }

  return true;
}
