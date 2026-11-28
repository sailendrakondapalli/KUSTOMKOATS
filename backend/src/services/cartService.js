import uow from '../db/uow.js';

export const CartService = {
  async get(userId) {
    return uow.cart.findByUser(userId);
  },

  async add(userId, productId, quantity = 1) {
    const existing = await uow.cart.findItem(userId, productId);
    if (existing) {
      return uow.cart.updateQuantity(existing.id, userId, existing.quantity + quantity);
    }
    return uow.cart.add(userId, productId, quantity);
  },

  async update(cartItemId, userId, quantity) {
    if (quantity <= 0) {
      await uow.cart.remove(cartItemId, userId);
      return null;
    }
    const item = await uow.cart.findItemById(cartItemId, userId);
    if (!item) throw Object.assign(new Error('Cart item not found'), { status: 404 });
    return uow.cart.updateQuantity(cartItemId, userId, quantity);
  },

  async remove(cartItemId, userId) {
    await uow.cart.remove(cartItemId, userId);
  },

  async clear(userId) {
    await uow.cart.clear(userId);
  },
};
