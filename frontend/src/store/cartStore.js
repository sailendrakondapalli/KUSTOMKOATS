import { create } from "zustand"
import api from "../services/apiClient"

const CART_KEY = "jewelry_cart"
const getLocal = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") } catch { return [] } }
const saveLocal = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items))

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  loadCart: async (userId) => {
    if (!userId) { set({ items: getLocal() }); return }
    set({ loading: true })
    try {
      const response = await api.cart.get();
      set({ items: response.data || [], loading: false })
    } catch (e) {
      console.warn("Cart load failed, using localStorage:", e.message)
      set({ items: getLocal(), loading: false })
    }
  },

  mergeLocalCart: async (userId) => {
    const local = getLocal()
    if (!local.length) return
    for (const item of local) {
      try {
        await api.cart.add(item.product_id, item.quantity);
      } catch (e) {
        console.warn("Failed to merge cart item:", e.message);
      }
    }
    localStorage.removeItem(CART_KEY)
    get().loadCart(userId)
  },

  addToCart: async (product, userId) => {
    // Always update local state immediately for responsiveness
    const { items } = get()
    const existing = items.find(i => i.product_id === product.id)
    let newItems
    if (existing) {
      newItems = items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
    } else {
      newItems = [...items, { product_id: product.id, quantity: 1, products: product, id: `local_${product.id}` }]
    }
    set({ items: newItems })

    if (!userId) { saveLocal(newItems); return }

    // Sync to backend
    try {
      await api.cart.add(product.id, 1);
      // Reload to get real IDs
      await get().loadCart(userId)
    } catch (e) {
      console.warn("Cart sync failed (product may be mock data):", e.message)
      // Keep local state, save to localStorage as backup
      saveLocal(newItems)
    }
  },

  updateQuantity: async (cartItemId, quantity, userId) => {
    const { items } = get()
    // Optimistic update immediately
    const updated = quantity <= 0
      ? items.filter(i => i.id !== cartItemId && i.product_id !== cartItemId)
      : items.map(i => (i.id === cartItemId || i.product_id === cartItemId) ? { ...i, quantity } : i)
    set({ items: updated })

    if (!userId) { saveLocal(updated); return }

    // Sync to backend (only if real DB id, not local_xxx)
    if (String(cartItemId).startsWith('local_')) { saveLocal(updated); return }
    try {
      await api.cart.update(cartItemId, quantity);
    } catch (e) {
      console.warn("Cart update failed:", e.message)
      saveLocal(updated)
    }
  },

  removeFromCart: async (cartItemId, userId) => {
    // Optimistic remove immediately
    const updated = get().items.filter(i => i.id !== cartItemId && i.product_id !== cartItemId)
    set({ items: updated })

    if (!userId) { saveLocal(updated); return }
    if (String(cartItemId).startsWith('local_')) { saveLocal(updated); return }
    try {
      await api.cart.remove(cartItemId);
    } catch (e) {
      console.warn("Cart remove failed:", e.message)
      saveLocal(updated)
    }
  },

  clearCart: async (userId) => {
    if (!userId) { localStorage.removeItem(CART_KEY); set({ items: [] }); return }
    try {
      await api.cart.clear();
      set({ items: [] })
    } catch (e) {
      console.warn("Cart clear failed:", e.message);
      localStorage.removeItem(CART_KEY);
      set({ items: [] });
    }
  },

  addBundleToCart: async (bundle, userId) => {
    if (!bundle || !bundle.bundle_items || bundle.bundle_items.length === 0) {
      throw new Error('Invalid bundle data')
    }

    // Add each product in the bundle to cart with specified quantities
    const addPromises = bundle.bundle_items.map(async (item) => {
      const product = item.products
      const quantity = item.quantity || 1

      // Add the product to cart (multiple times if quantity > 1)
      for (let i = 0; i < quantity; i++) {
        await get().addToCart(product, userId)
      }
    })

    await Promise.all(addPromises)
    
    // Return count of items added
    return bundle.bundle_items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  },

  getTotal: () => get().items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0),
  getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
}))
