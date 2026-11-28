import { supabase } from '../../config/supabase.js';

export const orderRepository = {
  async findByUser(userId, limit = 20, offset = 0) {
    const { data, error, count } = await supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { orders: data || [], count: count || 0 };
  },

  async findAll(filters = {}, limit = 50, offset = 0) {
    let q = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (filters.status)         q = q.eq('order_status', filters.status);
    if (filters.payment_status) q = q.eq('payment_status', filters.payment_status);

    const { data, error, count } = await q;
    if (error) throw error;
    return { orders: data || [], count: count || 0 };
  },

  async findById(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(id, name, images, price))')
      .eq('id', orderId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('orders')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createItems(items) {
    const { error } = await supabase.from('order_items').insert(items);
    if (error) throw error;
  },

  async updateStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * ACID: create order + items atomically via Supabase RPC.
   * Falls back to sequential inserts when RPC is not yet installed.
   */
  async createAtomic({ userId, items, totalAmount, discountAmount, shippingAddress, paymentMethod, promoCode, displayOrderId }) {
    try {
      const { data, error } = await supabase.rpc('create_order_atomic', {
        p_user_id: userId,
        p_items: items,
        p_total_amount: totalAmount,
        p_discount_amount: discountAmount,
        p_shipping_address: shippingAddress,
        p_payment_method: paymentMethod,
        p_promo_code: promoCode || null,
        p_display_order_id: displayOrderId,
      });
      if (error) throw error;
      return data;
    } catch (rpcErr) {
      // Fallback: sequential inserts (non-atomic, until RPC is deployed)
      console.warn('⚠️  RPC create_order_atomic not available, using sequential inserts:', rpcErr.message);

      const order = await this.create({
        user_id: userId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        promo_code: promoCode || null,
        display_order_id: displayOrderId,
        order_status: 'pending',
        payment_status: 'pending',
      });

      await this.createItems(
        items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name || null,
        }))
      );

      return order;
    }
  },
};
