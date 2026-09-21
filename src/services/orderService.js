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

    if (error) throw error
    if (!data.success) throw new Error(data.error || 'Failed to create Razorpay order')

    return data.order
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

    if (error) throw error
    if (!data.success) throw new Error(data.error || 'Payment verification failed')

    return data
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
    // Create order with pending status
    const { data: order, error } = await supabase
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

    if (error) throw error

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products?.price || 0,
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
 * Save order after successful payment (legacy - use createPendingOrder + verifyPayment instead)
 */
export async function saveOrder({ userId, items, total, address, paymentId, orderId }) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: total,
      payment_status: 'paid',
      order_status: 'confirmed',
      address: JSON.stringify(address),
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
    })
    .select()
    .single()

  if (error) throw error

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.products?.price || 0,
  }))

  await supabase.from('order_items').insert(orderItems)
  return order
}

export async function fetchUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name)), users(email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
