import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, ChevronLeft, ChevronRight, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { fetchProducts } from '../services/productService'
import { getSetting } from '../services/settingsService'
import { useCategoryStore } from '../store/categoryStore'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48]
const DEFAULT_PAGE_SIZE = 12

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [page, setPage] = useState(1)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)
  const isMobile = useIsMobile()

  // Default: list on desktop, grid on mobile
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 'list' : 'grid'
  )

  const { categories, loadCategories } = useCategoryStore()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'

  useEffect(() => {
    getSetting('products_per_page').then(val => {
      const n = parseInt(val)
      if (n && PAGE_SIZE_OPTIONS.includes(n)) setPageSize(n)
    }).catch(() => {})
    loadCategories()
  }, [])

  useEffect(() => { setPage(1) }, [category, search, sort, pageSize])

  const matchedCategory = categories.find(c => c.toLowerCase() === search.toLowerCase())

  useEffect(() => {
    if (matchedCategory && !category) {
      const params = new URLSearchParams(searchParams)
      params.set('category', matchedCategory)
      params.delete('search')
      setSearchParams(params, { replace: true })
      return
    }
    setLoading(true)
    fetchProducts({ category, search, sort }).then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [category, search, sort])

  // Close sort dropdown on outside click
  useEffect(() => {
    const fn = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters = !!(category || search)

  const totalPages = Math.ceil(products.length / pageSize)
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize)

  const pageTitle = category ? `${category} - Kustom Koats` : 'All Products - Kustom Koats'
  const headingText = category || 'All Products'

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Shop ${category || 'all'} automotive pearls at Kustom Koats. Premium quality with 300+ colors available.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6" style={{ background: "#FFFFFF" }}>

        {/* -- TOP BAR ROW 1: Title + result count + view toggle -- */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "#000000", fontFamily: "'Rajdhani', 'Inter', sans-serif" }}>
              {headingText}
            </h1>
            {search && (
              <p className="text-sm mt-0.5" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                Results for: <span className="font-semibold" style={{ color: "#FF0000" }}>"{search}"</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            {/* Result count */}
            <span className="text-xs hidden sm:block" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              {loading ? '...' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
            </span>

            {/* View toggle */}
            <div className="flex items-center rounded-lg p-0.5" style={{ background: "#F8F8F8", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'shadow-sm' : ''}`}
                style={{ 
                  background: viewMode === 'grid' ? '#FF0000' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : '#666666'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'shadow-sm' : ''}`}
                style={{ 
                  background: viewMode === 'list' ? '#FF0000' : 'transparent',
                  color: viewMode === 'list' ? '#FFFFFF' : '#666666'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* -- TOP BAR ROW 2: Category pills + sort -- */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {/* Scrollable category pills */}
          <div className="flex items-center gap-1.5 flex-nowrap min-w-0 flex-1">
            <button
              onClick={() => setFilter('category', '')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all`}
              style={{
                background: !category ? '#FF0000' : '#F8F8F8',
                color: !category ? '#FFFFFF' : '#333333',
                border: `1px solid ${!category ? '#FF0000' : 'rgba(0, 0, 0, 0.1)'}`,
                fontFamily: "'Inter', sans-serif"
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter('category', cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all`}
                style={{
                  background: category === cat || search.toLowerCase() === cat.toLowerCase() ? '#FF0000' : '#F8F8F8',
                  color: category === cat || search.toLowerCase() === cat.toLowerCase() ? '#FFFFFF' : '#333333',
                  border: `1px solid ${category === cat || search.toLowerCase() === cat.toLowerCase() ? '#FF0000' : 'rgba(0, 0, 0, 0.1)'}`,
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right: clear + sort */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs transition-colors whitespace-nowrap"
                style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}
              >
                <X size={12} /> Clear
              </button>
            )}

            {/* Custom sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(o => !o)}
                className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-2 transition-colors whitespace-nowrap"
                style={{
                  background: "#F8F8F8",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  color: "#333333",
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <SlidersHorizontal size={12} />
                {SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
                <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.1)" }}
                  >
                    {SORT_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => { setFilter('sort', o.value); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors`}
                        style={{
                          background: sort === o.value ? '#F8F8F8' : 'transparent',
                          color: sort === o.value ? '#FF0000' : '#333333',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: sort === o.value ? 600 : 400
                        }}
                      >
                        {o.value === sort && <span className="mr-1">✓</span>}
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* -- MAIN LAYOUT: sidebar (desktop) + content -- */}
        <div className="flex gap-6">

          {/* Sticky sidebar — desktop only */}
          <aside className="hidden lg:block w-[220px] flex-shrink-0">
            <div className="sticky top-20 rounded-2xl overflow-hidden shadow-sm" style={{ background: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
              <div className="px-4 py-3" style={{ background: "#FF0000" }}>
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>Categories</h2>
              </div>
              <nav className="py-2">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left`}
                  style={{
                    color: !category ? '#FF0000' : '#333333',
                    fontWeight: !category ? 600 : 400,
                    background: !category ? '#FFF5F5' : 'transparent',
                    borderLeft: !category ? '2px solid #FF0000' : '2px solid transparent',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  <span>All</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                    background: "#F8F8F8",
                    color: "#666666",
                    border: "1px solid rgba(0, 0, 0, 0.1)"
                  }}>
                    {loading ? '...' : products.length}
                  </span>
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length
                  const active = category === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilter('category', cat)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left`}
                      style={{
                        color: active ? '#FF0000' : '#333333',
                        fontWeight: active ? 600 : 400,
                        background: active ? '#FFF5F5' : 'transparent',
                        borderLeft: active ? '2px solid #FF0000' : '2px solid transparent',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      {count > 0 && (
                        <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full`} style={{
                          background: active ? '#FF0000' : '#F8F8F8',
                          color: active ? '#FFFFFF' : '#666666',
                          border: active ? 'none' : '1px solid rgba(0, 0, 0, 0.1)'
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Product list/grid area */}
          <div className="flex-1 min-w-0">

            {/* Per-page selector + count */}
            {!loading && products.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                  Showing <span className="font-medium" style={{ color: "#FF0000" }}>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, products.length)}</span> of <span className="font-medium" style={{ color: "#FF0000" }}>{products.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs hidden sm:block" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                    style={{
                      background: "#F8F8F8",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      color: "#333333",
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} layout="list" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array(pageSize).fill(0).map((_, i) => <SkeletonCard key={i} layout="grid" />)}
                </div>
              )
            ) : products.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <span className="text-6xl mb-4 leading-none">🔍</span>
                <h3 className="text-lg font-bold mb-1" style={{ color: "#000000", fontFamily: "'Rajdhani', 'Inter', sans-serif" }}>
                  No Products Found
                </h3>
                <p className="text-sm mb-6 max-w-xs" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                  {search
                    ? `We couldn't find any products matching "${search}". Try a different keyword or browse categories.`
                    : 'No products in this category yet. Check back soon or browse all.'}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
                  style={{
                    background: "#FF0000",
                    color: "#FFFFFF",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Browse All Products
                </button>
              </motion.div>
            ) : (
              <>
                {/* Products */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={
                      viewMode === 'list'
                        ? 'flex flex-col gap-3'
                        : 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                    }
                  >
                    {pagedProducts.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      >
                        <ProductCard product={p} layout={isMobile ? 'grid' : viewMode} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                    <button
                      onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg transition-all disabled:opacity-40"
                      style={{
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        color: "#333333",
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, idx) =>
                        p === '…'
                          ? <span key={`ellipsis-${idx}`} className="text-xs px-1" style={{ color: "#666666" }}>…</span>
                          : (
                            <button
                              key={p}
                              onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                              className={`w-8 h-8 text-xs rounded-lg transition-all`}
                              style={{
                                background: p === page ? '#FF0000' : 'transparent',
                                color: p === page ? '#FFFFFF' : '#333333',
                                border: `1px solid ${p === page ? '#FF0000' : 'rgba(0, 0, 0, 0.1)'}`,
                                fontFamily: "'Inter', sans-serif"
                              }}
                            >
                              {p}
                            </button>
                          )
                      )
                    }
                    <button
                      onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-xs rounded-lg transition-all disabled:opacity-40"
                      style={{
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        color: "#333333",
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
