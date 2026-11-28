import { CartService } from '../services/cartService.js';

export async function getCart(req, res) {
  try {
    const data = await CartService.get(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart', message: error.message });
  }
}

export async function addToCart(req, res) {
  try {
    const { product_id, quantity } = req.body;
    const data = await CartService.add(req.user.id, product_id, quantity || 1);
    res.status(201).json({ success: true, data, message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart', message: error.message });
  }
}

export async function updateCartItem(req, res) {
  try {
    const data = await CartService.update(req.params.id, req.user.id, req.body.quantity);
    if (data === null) {
      res.json({ success: true, message: 'Item removed from cart' });
    } else {
      res.json({ success: true, data, message: 'Cart updated' });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart', message: error.message });
  }
}

export async function removeFromCart(req, res) {
  try {
    await CartService.remove(req.params.id, req.user.id);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item', message: error.message });
  }
}

export async function clearCart(req, res) {
  try {
    await CartService.clear(req.user.id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart', message: error.message });
  }
}
