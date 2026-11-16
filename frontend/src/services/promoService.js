import api from './apiClient'

// Fetch all active codes
export async function fetchActiveCodes() {
  try {
    const response = await api.promo.validate() // Gets all active codes
    return response.data || []
  } catch (error) {
    console.error('Error fetching active codes:', error)
    return []
  }
}

// Fetch ALL codes (admin)
export async function fetchAllCodes() {
  try {
    const response = await api.promo.validate() // Admin endpoint should return all
    return response.data || []
  } catch (error) {
    console.error('Error fetching all codes:', error)
    return []
  }
}

// Get code IDs already used by this user
export async function fetchUsedCodeIds(userId) {
  if (!userId) return []
  try {
    // This would need a backend endpoint like GET /api/promo/used
    // For now, return empty array
    return []
  } catch (error) {
    return []
  }
}

/**
 * Calculate item-level discount for a promo code against cart items.
 * Discount applies ONLY to product cost. Shipping is NEVER touched.
 */
export function calcItemDiscount(promo, items) {
  const qualifyingItems = items.filter(item => {
    if (promo.applicable_category) {
      if ((item.products?.category || '').toLowerCase() !== promo.applicable_category.toLowerCase()) return false
    }
    if (!promo.applicable_category && promo.min_order_amount) {
      if ((item.products?.price || 0) < promo.min_order_amount) return false
    }
    return true
  })

  if (qualifyingItems.length === 0) return 0

  const qualifyingSubtotal = qualifyingItems.reduce(
    (s, item) => s + (item.products?.price || 0) * item.quantity, 0
  )

  if (promo.discount_type === 'percentage') {
    return Math.floor((qualifyingSubtotal * promo.discount_value) / 100)
  } else {
    return Math.min(promo.discount_value, qualifyingSubtotal)
  }
}

/**
 * Check if a promo code's conditions are met (without network call).
 */
export function checkEligibility(promo, { cartSubtotal, cartCategories, usedIds }) {
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { eligible: false, reason: 'Expired' }
  }
  if (promo.is_one_time && usedIds.includes(promo.id)) {
    return { eligible: false, reason: 'Already used' }
  }
  if (promo.min_order_amount && cartSubtotal < promo.min_order_amount) {
    return { eligible: false, reason: `Min order ₹${promo.min_order_amount.toLocaleString('en-IN')} required` }
  }
  if (promo.applicable_category) {
    const match = cartCategories.some(c => c.toLowerCase() === promo.applicable_category.toLowerCase())
    if (!match) return { eligible: false, reason: `Only for ${promo.applicable_category}` }
  }
  return { eligible: true, reason: null }
}

/**
 * Full server-side validation before order placement.
 */
export async function validatePromoCode({ code, userId, cartSubtotal, cartItems = [], cartCategories = [] }) {
  try {
    const response = await api.promo.validate(code)
    
    if (!response.valid) {
      return { valid: false, message: response.message || 'Invalid promo code' }
    }
    
    const promo = response.data
    const discountAmount = calcItemDiscount(promo, cartItems)
    
    return { valid: true, promo, discountAmount }
  } catch (error) {
    return { valid: false, message: error.message || 'Invalid or expired promo code' }
  }
}

// Record usage after order placed
export async function recordPromoUse({ codeId, userId, orderId }) {
  try {
    await api.promo.apply(codeId, { user_id: userId, order_id: orderId })
  } catch (error) {
    console.error('Failed to record promo use:', error.message)
  }
}

// Admin CRUD - these would need backend endpoints
export async function createPromoCode(data) {
  try {
    const response = await api.promo.apply(data.code, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export async function updatePromoCode(id, data) {
  // Would need PUT /api/promo/:id endpoint
  console.warn('updatePromoCode not implemented - needs backend endpoint')
}

export async function deletePromoCode(id) {
  // Would need DELETE /api/promo/:id endpoint
  console.warn('deletePromoCode not implemented - needs backend endpoint')
}
