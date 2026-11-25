import * as cartService from '../services/cartService.js';

/**
 * Get user's cart
 */
export async function getCart(req, res) {
  try {
    const userId = req.user.id;
    const data = await cartService.fetchCart(userId);

    res.json({ data });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      error: 'Failed to fetch cart',
      message: error.message
    });
  }
}

/**
 * Add item to cart
 */
export async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    const data = await cartService.addToCart(userId, product_id, quantity);

    res.status(201).json({
      success: true,
      data,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      message: error.message
    });
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const data = await cartService.updateCartItem(id, userId, quantity);

    if (data === null) {
      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      res.json({
        success: true,
        data,
        message: 'Cart updated'
      });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      error: 'Failed to update cart',
      message: error.message
    });
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await cartService.removeFromCart(id, userId);

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      error: 'Failed to remove item',
      message: error.message
    });
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(req, res) {
  try {
    const userId = req.user.id;
    await cartService.clearCart(userId);

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: error.message
    });
  }
}
