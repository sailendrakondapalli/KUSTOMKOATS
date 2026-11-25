import * as orderModel from '../models/orderModel.js';

/**
 * Get user's orders
 */
export async function fetchUserOrders(userId, limit, offset) {
  try {
    const { orders, count } = await orderModel.getUserOrders(userId, limit, offset);
    return { orders, count };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
}

/**
 * Get all orders (admin)
 */
export async function fetchAllOrders(status, limit, offset) {
  try {
    const { orders, count } = await orderModel.getAllOrders(status, limit, offset);
    return { orders, count };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
}

/**
 * Get single order
 */
export async function fetchOrder(orderId, userId, isAdmin) {
  try {
    const order = await orderModel.getOrderById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check access permission
    if (order.user_id !== userId && !isAdmin) {
      throw new Error('Forbidden: You do not have access to this order');
    }

    return order;
  } catch (error) {
    throw error;
  }
}

/**
 * Create new order
 */
export async function createOrder(userId, items, shippingAddress, paymentMethod, promoCode) {
  try {
    // Calculate total
    let total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Apply promo code if provided
    let discount = 0;
    if (promoCode) {
      const promo = await orderModel.getPromoCode(promoCode);

      if (promo) {
        // Check if promo is valid
        const now = new Date();
        const validFrom = new Date(promo.valid_from);
        const validUntil = new Date(promo.valid_until);

        if (now >= validFrom && now <= validUntil) {
          if (promo.discount_type === 'percentage') {
            discount = (total * promo.discount_value) / 100;
          } else {
            discount = promo.discount_value;
          }
        }
      }
    }

    const finalTotal = total - discount;

    // Create order
    const order = await orderModel.createOrder(
      userId,
      finalTotal,
      discount,
      shippingAddress,
      paymentMethod,
      promoCode
    );

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    await orderModel.createOrderItems(orderItems);

    return order;
  } catch (error) {
    throw new Error(error.message || 'Failed to create order');
  }
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const order = await orderModel.updateOrderStatus(orderId, status);

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if user is admin
 */
export async function checkAdminRole(userId) {
  try {
    const profile = await orderModel.getUserProfile(userId);
    return profile?.role === 'admin';
  } catch (error) {
    return false;
  }
}
