import { create } from 'zustand'
import { supabase } from '../lib/supabase'

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
      // 1. Try the dedicated categories table (preferred — from our SQL migration)
      const { data: catRows, error: catErr } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (!catErr && catRows?.length) {
        set({ categories: catRows.map(r => r.name), loading: false })
        return
      }

      // 2. Fall back to site_settings custom_categories + defaults
      const { data: setting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'custom_categories')
        .single()

      let custom = []
      if (setting?.value) {
        try { custom = JSON.parse(setting.value) } catch {}
      }

      const merged = [...new Set([...CATEGORIES_DEFAULT, ...custom])].sort()
      set({ categories: merged, loading: false })
    } catch (err) {
      console.warn('categoryStore loadCategories error:', err.message)
      set({ categories: [...CATEGORIES_DEFAULT], loading: false })
    }
  },

  // Legacy add/delete kept for backwards compat but now also touches categories table
  addCategory: async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const current = get().categories
    if (current.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) return

    // Try inserting into categories table
    await supabase.from('categories').insert({
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
      sort_order: current.length,
      is_active: true,
    }).then(({ error }) => {
      if (error) console.warn('addCategory insert error:', error.message)
    })

    set({ categories: [...new Set([...current, trimmed])].sort() })
  },

  deleteCategory: async (name) => {
    if (CATEGORIES_DEFAULT.includes(name)) return

    await supabase.from('categories').delete().eq('name', name)
      .then(({ error }) => {
        if (error) console.warn('deleteCategory error:', error.message)
      })

    set({ categories: get().categories.filter(c => c !== name) })
  },

  isDefault: (name) => CATEGORIES_DEFAULT.includes(name),
}))

// Named re-export kept for existing imports
export const CATEGORIES = CATEGORIES_DEFAULT
