import { supabase } from '../config/supabase.js';

/**
 * Get user's orders
 */
export async function getUserOrders(userId, limit, offset) {
  const { data, error, count } = await supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .eq('user_id', userId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { orders: data, count };
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(status, limit, offset) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*), profiles(email, full_name)', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { orders: data, count };
}

/**
 * Get single order by ID
 */
export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get user profile to check role
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create new order
 */
export async function createOrder(userId, total, discount, shippingAddress, paymentMethod, promoCode) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      user_id: userId,
      total,
      discount,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status: 'pending',
      promo_code: promoCode || null
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create order items
 */
export async function createOrderItems(orderItems) {
  const { error } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (error) throw error;
}

/**
 * Get promo code
 */
export async function getPromoCode(code) {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}
