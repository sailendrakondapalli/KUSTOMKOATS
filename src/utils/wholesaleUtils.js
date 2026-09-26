import { supabase } from '../lib/supabase'

/**
 * Check if the current user has an approved wholesale application
 * @param {string} userEmail - The user's email address
 * @returns {Promise<boolean>} - True if user is an approved wholesaler
 */
export async function isApprovedWholesaler(userEmail) {
  if (!userEmail) return false

  try {
    const { data, error } = await supabase
      .from('wholesale_applications')
      .select('status')
      .eq('email', userEmail)
      .eq('status', 'approved')
      .limit(1)

    if (error) {
      console.error('Error checking wholesale status:', error)
      return false
    }

    return data && data.length > 0
  } catch (err) {
    console.error('Error in isApprovedWholesaler:', err)
    return false
  }
}

/**
 * Get wholesale pricing for a product
 * @param {number} regularPrice - Regular retail price
 * @param {number|null} wholesalePrice - Wholesale price if set
 * @returns {number} - The wholesale price to display
 */
export function getWholesalePrice(regularPrice, wholesalePrice) {
  // If wholesale price is explicitly set, use it
  if (wholesalePrice && wholesalePrice > 0) {
    return wholesalePrice
  }
  
  // Otherwise, return regular price (no discount)
  return regularPrice
}

/**
 * Format price for display
 * @param {number} price - Price to format
 * @param {boolean} isWholesaler - Whether to show wholesale pricing
 * @param {number|null} wholesalePrice - Wholesale price if available
 * @returns {string} - Formatted price string
 */
export function formatPrice(price, isWholesaler = false, wholesalePrice = null) {
  if (!price) return '₹0'
  
  const displayPrice = isWholesaler && wholesalePrice 
    ? getWholesalePrice(price, wholesalePrice)
    : price
    
  return `₹${displayPrice.toLocaleString('en-IN')}`
}
