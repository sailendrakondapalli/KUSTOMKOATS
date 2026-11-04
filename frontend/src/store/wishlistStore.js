import { create } from "zustand"
import api from "../services/apiClient"

const WL_KEY = "jewelry_wishlist"
const getLocal = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]") } catch { return [] } }
const saveLocal = (items) => localStorage.setItem(WL_KEY, JSON.stringify(items))

export const useWishlistStore = create((set, get) => ({
  items: [],

  loadWishlist: async (userId) => {
    if (!userId) { set({ items: getLocal() }); return }
    try {
      const response = await api.wishlist.get();
      set({ items: response.data || [] })
    } catch (e) {
      console.warn("Wishlist load failed:", e.message)
      set({ items: getLocal() })
    }
  },

  toggleWishlist: async (product, userId) => {
    const { items } = get()
    const existing = items.find(i => i.product_id === product.id)

    if (existing) {
      // Remove
      const newItems = items.filter(i => i.product_id !== product.id)
      set({ items: newItems })
      if (!userId) { saveLocal(newItems); return false }
      try {
        await api.wishlist.remove(existing.id);
      } catch (e) {
        console.warn("Wishlist remove failed:", e.message)
        saveLocal(newItems)
      }
      return false
    } else {
      // Add - optimistic update first
      const tempItem = { id: `local_${product.id}`, product_id: product.id, products: product }
      const newItems = [...items, tempItem]
      set({ items: newItems })
      if (!userId) { saveLocal(newItems); return true }
      try {
        const response = await api.wishlist.add(product.id);
        // Replace temp with real
        set({ items: [...items.filter(i => i.product_id !== product.id), response.data] })
      } catch (e) {
        console.warn("Wishlist add failed:", e.message)
        saveLocal(newItems)
      }
      return true
    }
  },

  isWishlisted: (productId) => get().items.some(i => i.product_id === productId),
}))
