import * as orderService from '../services/orderService.js';
import { sendOrderConfirmationEmail, sendOrderDeliveredEmail } from '../services/emailService.js';

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

    // Send order confirmation email (non-blocking)
    try {
      const userEmail = req.user.email;
      const userName = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Customer';
      const orderId = order.display_order_id || order.id?.slice(0, 8).toUpperCase();
      const address = typeof shipping_address === 'string'
        ? shipping_address
        : [shipping_address?.address, shipping_address?.city, shipping_address?.state, shipping_address?.pincode]
            .filter(Boolean).join(', ');

      sendOrderConfirmationEmail({
        name: userName,
        email: userEmail,
        orderId,
        items: items.map(i => ({ name: i.name || i.product_name || 'Product', quantity: i.quantity, price: i.price })),
        total: order.total_amount,
        address,
      }).catch(err => console.error('Order email error:', err.message));
    } catch (emailErr) {
      console.error('Order email setup error:', emailErr.message);
    }

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

    // Send delivery email when status changes to 'delivered'
    if (status === 'delivered' && order) {
      try {
        // Fetch user email from profiles/users table
        const { supabase } = await import('../config/supabase.js');
        const { data: userData } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', order.user_id)
          .single();

        if (userData?.email) {
          sendOrderDeliveredEmail({
            name: userData.name || userData.email.split('@')[0],
            email: userData.email,
            orderId: order.display_order_id || id.slice(0, 8).toUpperCase(),
            total: order.total_amount,
          }).catch(err => console.error('Delivery email error:', err.message));
        }
      } catch (emailErr) {
        console.error('Delivery email setup error:', emailErr.message);
      }
    }

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
