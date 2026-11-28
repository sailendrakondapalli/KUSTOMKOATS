import * as searchModel from '../models/searchModel.js';

/**
 * Search products with filters and pagination
 */
export async function searchProducts({ searchTerm, category, minPrice, maxPrice, limit, offset }) {
  const filters = {};
  
  if (searchTerm) filters.searchTerm = searchTerm;
  if (category) filters.category = category;
  if (minPrice !== undefined) filters.minPrice = parseFloat(minPrice);
  if (maxPrice !== undefined) filters.maxPrice = parseFloat(maxPrice);

  console.log('🔍 Searching products with filters:', { searchTerm, category, minPrice, maxPrice, limit, offset });

  const { products, count } = await searchModel.searchProducts(filters, limit, offset);

  console.log('✅ Products found:', { count, dataLength: products?.length });

  return { products, count };
}

/**
 * Get available filter options
 */
export async function getFilterOptions() {
  const [categories, priceRange] = await Promise.all([
    searchModel.getAvailableCategories(),
    searchModel.getPriceRange()
  ]);

  return {
    categories,
    price_range: priceRange
  };
}
