import { create } from 'zustand'
import api from '../services/apiClient'

// Default fallback categories (used when DB table isn't seeded yet)
export const CATEGORIES_DEFAULT = [
  'Xtreme Kolorz',
  'Xtreme Wrap',
  'Accessories',
  'Wholesale',
]

export const useCategoryStore = create((set, get) => ({
  categories: [...CATEGORIES_DEFAULT],
  loading: false,

  loadCategories: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const response = await api.content.getCategories()
      if (response.data?.length) {
        set({ categories: response.data.map(r => r.name), loading: false })
        return
      }

      // Fall back to defaults if no categories returned
      set({ categories: [...CATEGORIES_DEFAULT], loading: false })
    } catch (err) {
      console.warn('categoryStore loadCategories error:', err.message)
      set({ categories: [...CATEGORIES_DEFAULT], loading: false })
    }
  },

  // Legacy add/delete kept for backwards compat but now uses backend API
  addCategory: async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const current = get().categories
    if (current.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) return

    try {
      await api.content.createCategory({
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
        sort_order: current.length,
        is_active: true,
      })
      set({ categories: [...new Set([...current, trimmed])].sort() })
    } catch (error) {
      console.warn('addCategory error:', error.message)
    }
  },

  deleteCategory: async (name) => {
    if (CATEGORIES_DEFAULT.includes(name)) return

    try {
      await api.content.deleteCategory(name)
      set({ categories: get().categories.filter(c => c !== name) })
    } catch (error) {
      console.warn('deleteCategory error:', error.message)
    }
  },

  isDefault: (name) => CATEGORIES_DEFAULT.includes(name),
}))

// Named re-export kept for existing imports
export const CATEGORIES = CATEGORIES_DEFAULT
