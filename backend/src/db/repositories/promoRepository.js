import { supabase } from '../../config/supabase.js';

export const promoRepository = {
  async findByCode(code) {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async findAll() {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * ACID: validate promo + increment usage atomically via RPC.
   * Falls back to sequential read-then-update when RPC not deployed.
   */
  async applyAtomic(code, userId, orderTotal) {
    try {
      const { data, error } = await supabase.rpc('apply_promo_code', {
        p_code: code.toUpperCase().trim(),
        p_user_id: userId,
        p_order_total: orderTotal,
      });
      if (error) throw error;
      return data; // { discount_amount, final_total, promo_id }
    } catch (rpcErr) {
      console.warn('⚠️  RPC apply_promo_code not available, using fallback:', rpcErr.message);

      const promo = await this.findByCode(code);
      if (!promo) return { discount_amount: 0, final_total: orderTotal };

      const now = new Date();
      if (promo.valid_until && now > new Date(promo.valid_until)) {
        return { discount_amount: 0, final_total: orderTotal };
      }
      if (promo.min_order_amount && orderTotal < promo.min_order_amount) {
        return { discount_amount: 0, final_total: orderTotal };
      }
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        return { discount_amount: 0, final_total: orderTotal };
      }

      let discount = 0;
      if (promo.discount_type === 'percentage') {
        discount = (orderTotal * promo.discount_value) / 100;
        if (promo.max_discount) discount = Math.min(discount, promo.max_discount);
      } else {
        discount = promo.discount_value;
      }

      // Increment usage (best-effort, non-atomic fallback)
      await supabase
        .from('promo_codes')
        .update({ usage_count: (promo.usage_count || 0) + 1 })
        .eq('id', promo.id);

      return {
        discount_amount: discount,
        final_total: Math.max(0, orderTotal - discount),
        promo_id: promo.id,
      };
    }
  },
};
