import uow from '../db/uow.js';

function generateDisplayOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KK-${ts}-${rand}`;
}

export const OrderService = {
  async listForUser(userId, { limit = 20, offset = 0 } = {}) {
    return uow.orders.findByUser(userId, limit, offset);
  },

  async listAll(filters, { limit = 50, offset = 0 } = {}, user) {
    if (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    return uow.orders.findAll(filters, limit, offset);
  },

  async get(orderId, user) {
    const order = await uow.orders.findById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });

    const isAdmin = user.role === 'admin' || user.email === process.env.ADMIN_EMAIL;
    if (order.user_id !== user.id && !isAdmin) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    return order;
  },

  /**
   * Create order with ACID transaction (via RPC with sequential fallback).
   * Applies promo code atomically via promoRepository.applyAtomic().
   */
  async create({ userId, items, shippingAddress, paymentMethod, promoCode }) {
    if (!items?.length) throw Object.assign(new Error('No items in order'), { status: 400 });

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

    // Atomic promo application
    let discountAmount = 0;
    if (promoCode) {
      const result = await uow.promo.applyAtomic(promoCode, userId, subtotal);
      discountAmount = result.discount_amount || 0;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const displayOrderId = generateDisplayOrderId();

    // Atomic order + items creation
    const order = await uow.orders.createAtomic({
      userId,
      items,
      totalAmount,
      discountAmount,
      shippingAddress,
      paymentMethod,
      promoCode: promoCode || null,
      displayOrderId,
    });

    return order;
  },

  async updateStatus(orderId, status, user) {
    if (user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    const order = await uow.orders.updateStatus(orderId, status);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    return order;
  },
};
