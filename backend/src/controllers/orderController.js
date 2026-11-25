import * as orderService from '../services/orderService.js';

/**
 * Get user's orders
 */
export async function getMyOrders(req, res) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const { orders, count } = await orderService.fetchUserOrders(req.user.id, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: orders,
      count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(req, res) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const { orders, count } = await orderService.fetchAllOrders(status, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: orders,
      count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
}

/**
 * Get single order
 */
export async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const isAdmin = await orderService.checkAdminRole(req.user.id);
    const order = await orderService.fetchOrder(id, req.user.id, isAdmin);

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);

    if (error.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (error.message.includes('Forbidden')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this order'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch order',
      message: error.message
    });
  }
}

/**
 * Create order
 */
export async function createOrder(req, res) {
  try {
    const { items, shipping_address, payment_method, promo_code } = req.body;
    const order = await orderService.createOrder(
      req.user.id,
      items,
      shipping_address,
      payment_method,
      promo_code
    );

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, status);

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);

    if (error.message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(500).json({
      error: 'Failed to update order',
      message: error.message
    });
  }
}
