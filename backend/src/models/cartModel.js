import { supabase } from '../config/supabase.js';

/**
 * Get user's cart items
 */
export async function getCartItems(userId) {
  const { data, error } = await supabase
    .from('cart')
    .select('id, product_id, quantity, products(id, name, price, images, custom_id)')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

/**
 * Find cart item by user and product
 */
export async function findCartItem(userId, productId) {
  const { data, error } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Add new item to cart
 */
export async function addCartItem(userId, productId, quantity) {
  const { data, error } = await supabase
    .from('cart')
    .insert({
      user_id: userId,
      product_id: productId,
      quantity
    })
    .select('*, products(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(cartItemId, userId, quantity) {
  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', userId)
    .select('*, products(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update existing cart item (increment quantity)
 */
export async function incrementCartItemQuantity(cartItemId, newQuantity) {
  const { data, error } = await supabase
    .from('cart')
    .update({ quantity: newQuantity })
    .eq('id', cartItemId)
    .select('*, products(*)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete cart item
 */
export async function deleteCartItem(cartItemId, userId) {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Clear all cart items for user
 */
export async function clearCart(userId) {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
