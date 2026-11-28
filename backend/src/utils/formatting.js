/**
 * Format price for display
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
}

/**
 * Format product for display
 */
export function formatProductForDisplay(product) {
  return {
    ...product,
    displayPrice: formatPrice(product.price),
    inStock: product.stock > 0,
    thumbnailUrl: product.images?.[0] || '/placeholder.png'
  };
}

/**
 * Format date to ISO string
 */
export function formatDate(date) {
  return new Date(date).toISOString();
}

/**
 * Sanitize string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}
