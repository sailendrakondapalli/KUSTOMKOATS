import { supabase } from '../../config/supabase.js';

export const cartRepository = {
  async findByUser(userId) {
    const { data, error } = await supabase
      .from('cart')
      .select('id, product_id, quantity, products(id, name, price, original_price, images, custom_id, stock, status)')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  async findItem(userId, productId) {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findItemById(cartItemId, userId) {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async add(userId, productId, quantity) {
    const { data, error } = await supabase
      .from('cart')
      .insert({ user_id: userId, product_id: productId, quantity })
      .select('*, products(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async updateQuantity(cartItemId, userId, quantity) {
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select('*, products(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async remove(cartItemId, userId) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async clear(userId) {
    const { error } = await supabase.from('cart').delete().eq('user_id', userId);
    if (error) throw error;
  },
};
