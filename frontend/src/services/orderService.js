import api from './apiClient'

/**
 * Create a Razorpay order via backend API
 */
export async function createRazorpayOrder(amount, receipt = null) {
  try {
    const response = await api.orders.create({
      amount,
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      action: 'create_razorpay'
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create Razorpay order')
    }
    
    return response.data
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw new Error(error.message || 'Failed to create payment order')
  }
}

/**
 * Verify Razorpay payment signature via backend API
 */
export async function verifyRazorpayPayment({ 
  razorpay_order_id, 
  razorpay_payment_id, 
  razorpay_signature,
  order_id 
}) {
  try {
    const response = await api.orders.update(order_id, {
      action: 'verify_payment',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Payment verification failed')
    }
    
    return response
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw new Error(error.message || 'Payment verification failed')
  }
}

/**
 * Create order in database (before payment)
 */
export async function createPendingOrder({ 
  userId = null, 
  guestEmail = null,
  guestName = null,
  guestPhone = null,
  items, 
  total, 
  address, 
  razorpayOrderId,
  orderNotes = null
}) {
  try {
    const orderData = {
      user_id: userId,
      guest_email: guestEmail,
      guest_name: guestName,
      guest_phone: guestPhone,
      items,
      total_amount: total,
      payment_status: 'pending',
      order_status: 'pending',
      payment_method: 'razorpay',
      address,
      razorpay_order_id: razorpayOrderId,
      order_notes: orderNotes
    }
    
    const response = await api.orders.create(orderData)
    return response.data
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error(error.message || 'Failed to create order')
  }
}

/**
 * Save order after successful payment
 */
export async function saveOrder({ userId, items, total, address, paymentId, orderId }) {
  try {
    const orderData = {
      user_id: userId,
      items,
      total_amount: total,
      payment_status: 'paid',
      order_status: 'confirmed',
      address,
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId
    }
    
    const response = await api.orders.create(orderData)
    return response.data
  } catch (error) {
    console.error('Error saving order:', error)
    throw error
  }
}

export async function fetchUserOrders(userId) {
  try {
    const response = await api.orders.getAll({ user_id: userId })
    return response.data || []
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw error
  }
}

export async function fetchAllOrders() {
  try {
    const response = await api.orders.getAll()
    return response.data || []
  } catch (error) {
    console.error('Error fetching all orders:', error)
    throw error
  }
}
