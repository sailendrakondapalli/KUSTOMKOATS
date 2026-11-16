import api from './apiClient'
import { supabase } from '../lib/supabase'

/**
 * Create a Razorpay order via Supabase Edge Function
 */
export async function createRazorpayOrder(amount, receipt = null) {
  try {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`
      }
    })
    
    if (error) {
      throw new Error(error.message || 'Failed to create Razorpay order')
    }
    
    return data
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw new Error(error.message || 'Failed to create payment order')
  }
}

/**
 * Verify Razorpay payment signature via Supabase Edge Function
 */
export async function verifyRazorpayPayment({ 
  razorpay_order_id, 
  razorpay_payment_id, 
  razorpay_signature,
  order_id 
}) {
  try {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order_id
      }
    })
    
    if (error) {
      throw new Error(error.message || 'Payment verification failed')
    }
    
    return data
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw new Error(error.message || 'Payment verification failed')
  }
}

/**
 * Create order in database (before payment) - Direct Supabase
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
    // Insert order into Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        guest_email: guestEmail,
        guest_name: guestName,
        guest_phone: guestPhone,
        total_amount: total,
        payment_status: 'pending',
        order_status: 'pending',
        payment_method: 'razorpay',
        address: JSON.stringify(address),
        razorpay_order_id: razorpayOrderId,
        order_notes: orderNotes
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error(error.message || 'Failed to create order')
  }
}

/**
 * Save order after successful payment - Direct Supabase
 */
export async function saveOrder({ userId, items, total, address, paymentId, orderId }) {
  try {
    // Insert order into Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: total,
        payment_status: 'paid',
        order_status: 'confirmed',
        payment_method: 'razorpay',
        address: JSON.stringify(address),
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    return order
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
