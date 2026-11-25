import * as cartModel from '../models/cartModel.js';

/**
 * Get user's cart
 */
export async function fetchCart(userId) {
  try {
    const cart = await cartModel.getCartItems(userId);
    return cart;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch cart');
  }
}

/**
 * Add item to cart
 */
export async function addToCart(userId, productId, quantity) {
  try {
    // Check if item already exists
    const existing = await cartModel.findCartItem(userId, productId);

    let result;
    if (existing) {
      // Update quantity by adding to existing
      const newQuantity = existing.quantity + quantity;
      result = await cartModel.incrementCartItemQuantity(existing.id, newQuantity);
    } else {
      // Insert new item
      result = await cartModel.addCartItem(userId, productId, quantity);
    }

    return result;
  } catch (error) {
    throw new Error(error.message || 'Failed to add item to cart');
  }
}

/**
 * Update cart item
 */
export async function updateCartItem(cartItemId, userId, quantity) {
  try {
    if (quantity === 0) {
      // Delete if quantity is 0
      await cartModel.deleteCartItem(cartItemId, userId);
      return null;
    } else {
      // Update quantity
      const item = await cartModel.updateCartItemQuantity(cartItemId, userId, quantity);
      return item;
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to update cart');
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId, userId) {
  try {
    await cartModel.deleteCartItem(cartItemId, userId);
  } catch (error) {
    throw new Error(error.message || 'Failed to remove item');
  }
}

/**
 * Clear cart
 */
export async function clearCart(userId) {
  try {
    await cartModel.clearCart(userId);
  } catch (error) {
    throw new Error(error.message || 'Failed to clear cart');
  }
}
