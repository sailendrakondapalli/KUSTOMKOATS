import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, ChevronRight, Home, SlidersHorizontal, ChevronDown, ShoppingCart, Heart } from 'lucide-react'
import { subcategoriesAPI } from '../services/apiClient'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A → Z', value: 'name_asc' },
]

const PAGE_SIZE = 12

function SubcategoryHeroBanner({ banner, subcategoryName }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const bgImage = isMobile && banner.mobile_image_url
    ? banner.mobile_image_url
    : banner.desktop_image_url

  return (
    <section style={{ position: 'relative', minHeight: isMobile ? 240 : 380, background: '#000', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {bgImage && (
        <img src={bgImage} alt={banner.heading || subcategoryName}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
          loading="eager" />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: isMobile ? '60px 20px 40px' : '100px 48px 80px', width: '100%', boxSizing: 'border-box' }}>
        {banner.heading && (
          <h1 style={{
            color: '#FFF',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: isMobile ? '2rem' : 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            margin: '0 0 12px',
            lineHeight: 1.1,
            maxWidth: 600,
          }}>
            {banner.heading}
          </h1>
        )}
        {banner.subheading && (
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif", fontSize: isMobile ? '0.9375rem' : '1.0625rem', maxWidth: 520, margin: '0 0 24px', lineHeight: 1.6 }}>
            {banner.subheading}
          </p>
        )}
        {banner.cta_text && banner.cta_link && (
          <Link to={banner.cta_link}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#CA2A31', color: '#FFF', borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#B02228'}
            onMouseLeave={e => e.currentTarget.style.background = '#CA2A31'}>
            {banner.cta_text} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </section>
  )
}

function DefaultHeroBanner({ subcategory, categorySlug }) {
  return (
    <section style={{ background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)', minHeight: 220, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03 }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 48px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <Link to={`/category/${categorySlug}`} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
            {subcategory.category?.name || 'Category'}
          </Link>
          <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: '#CA2A31', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{subcategory.name}</span>
        </div>
        <h1 style={{ color: '#FFF', fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.1 }}>
          {subcategory.name}
        </h1>
        {subcategory.description && (
          <p style={{ color: 'rgba(255,255,255,0.65)', fontFamily: "'Inter', sans-serif", fontSize: '1rem', maxWidth: 500, margin: 0, lineHeight: 1.6 }}>
            {subcategory.description}
          </p>
        )}
      </div>
    </section>
  )
}

function ProductCard({ product, onAddToCart, onToggleWishlist, inWishlist }) {
  const discountPct = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ border: '1px solid #E5E5E5', borderRadius: 10, overflow: 'hidden', background: '#FFF', transition: 'all 0.2s', cursor: 'pointer', height: '100%' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#CA2A31'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>

        {/* Image */}
        <div style={{ aspectRatio: '1', background: '#F8F8F8', position: 'relative', overflow: 'hidden' }}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              loading="lazy"
              onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.1 }}>🎨</span>
            </div>
          )}
          {discountPct && (
            <span style={{ position: 'absolute', top: 10, left: 10, background: '#CA2A31', color: '#FFF', fontSize: '0.6875rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'Inter', sans-serif" }}>
              -{discountPct}%
            </span>
          )}
          {/* Wishlist button */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(product) }}
            style={{ position: 'absolute', top: 8, right: 8, background: inWishlist ? '#CA2A31' : 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Heart size={15} style={{ color: inWishlist ? '#FFF' : '#888', fill: inWishlist ? '#FFF' : 'none' }} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          {product.subcategory && (
            <p style={{ color: '#CA2A31', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", margin: '0 0 4px' }}>
              {product.subcategory}
            </p>
          )}
          <h3 style={{ color: '#000', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 10px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: '#000', fontSize: '1rem', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span style={{ color: '#AAA', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", textDecoration: 'line-through' }}>
                ₹{product.original_price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onAddToCart(product) }}
            style={{ width: '100%', padding: '9px', background: '#000', border: 'none', borderRadius: 6, color: '#FFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Inter', sans-serif", transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#CA2A31'}
            onMouseLeave={e => e.currentTarget.style.background = '#000'}>
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function SubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams()
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist } = useWishlistStore()

  const [subcategory, setSubcategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Fetch subcategory + banner
  useEffect(() => {
    if (!subcategorySlug) return
    setLoading(true)
    setError(null)
    subcategoriesAPI.getBySlug(subcategorySlug)
      .then(res => {
        if (res?.data) setSubcategory(res.data)
        else setError('Subcategory not found')
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [subcategorySlug])

  // Fetch products for this subcategory
  const fetchProducts = useCallback(async (subId, sortKey, pageNum) => {
    if (!subId) return
    setProductsLoading(true)
    try {
      let q = supabase
        .from('products')
        .select('id, name, description, price, original_price, images, stock, category, subcategory, subcategory_id, is_featured', { count: 'exact' })
        .eq('subcategory_id', subId)
        .eq('status', 'Active')
        .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)

      if (sortKey === 'price_asc') q = q.order('price', { ascending: true })
      else if (sortKey === 'price_desc') q = q.order('price', { ascending: false })
      else if (sortKey === 'name_asc') q = q.order('name', { ascending: true })
      else q = q.order('created_at', { ascending: false })

      const { data, count, error } = await q
      if (error) throw error
      setProducts(data || [])
      setTotal(count || 0)
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (subcategory?.id) {
      fetchProducts(subcategory.id, sort, page)
    }
  }, [subcategory?.id, sort, page, fetchProducts])

  const activeBanner = subcategory?.banners?.find(b => b.is_active) || null

  const wishlistProductIds = new Set(wishlistItems.map(w => w.product_id || w.id))

  const handleAddToCart = async (product) => {
    if (!user) { toast.error('Sign in to add to cart'); return }
    await addItem(user.id, product.id, 1)
    toast.success(`${product.name} added to cart!`)
  }

  const handleToggleWishlist = async (product) => {
    if (!user) { toast.error('Sign in to save items'); return }
    if (wishlistProductIds.has(product.id)) {
      const item = wishlistItems.find(w => (w.product_id || w.id) === product.id)
      if (item) await removeWishlist(item.id)
      toast.success('Removed from wishlist')
    } else {
      await addWishlist(user.id, product.id)
      toast.success('Added to wishlist')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (error || !subcategory) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF', gap: 16 }}>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#000' }}>Subcategory Not Found</h1>
        <Link to="/" style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    )
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <Helmet>
        <title>{subcategory.seo_title || `${subcategory.name} | ${subcategory.category?.name || ''} | Kustom Koats`}</title>
        <meta name="description" content={subcategory.seo_description || subcategory.description || `Shop ${subcategory.name} products at Kustom Koats`} />
      </Helmet>

      {/* Hero Banner — dynamic per subcategory */}
      {activeBanner ? (
        <SubcategoryHeroBanner banner={activeBanner} subcategoryName={subcategory.name} />
      ) : (
        <DefaultHeroBanner subcategory={subcategory} categorySlug={categorySlug} />
      )}

      {/* Breadcrumb (shown below banner if banner was displayed) */}
      {activeBanner && (
        <div style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', padding: '12px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#888', fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} style={{ color: '#CCC' }} />
            <Link to={`/category/${categorySlug}`} style={{ color: '#888', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
              {subcategory.category?.name || 'Category'}
            </Link>
            <ChevronRight size={12} style={{ color: '#CCC' }} />
            <span style={{ color: '#CA2A31', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{subcategory.name}</span>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section style={{ background: '#FFF', maxWidth: 1280, margin: '0 auto', padding: '40px 24px 60px', boxSizing: 'border-box', width: '100%' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.375rem', fontWeight: 700, color: '#000', margin: 0 }}>
              {subcategory.name}
            </h2>
            <p style={{ color: '#888', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", margin: '4px 0 0' }}>
              {productsLoading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={15} style={{ color: '#888' }} />
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1) }}
              style={{ padding: '8px 32px 8px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000', background: '#FFF', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {Array(PAGE_SIZE).fill(0).map((_, i) => (
              <div key={i} style={{ border: '1px solid #F0F0F0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1', background: '#F5F5F5', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ height: 16, background: '#F0F0F0', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 12, background: '#F0F0F0', borderRadius: 4, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '1.75rem' }}>📦</span>
            </div>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000', margin: '0 0 8px' }}>
              No Products Yet
            </h3>
            <p style={{ color: '#888', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', margin: '0 0 20px' }}>
              Products for {subcategory.name} are coming soon.
            </p>
            <Link to={`/category/${categorySlug}`}
              style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to {subcategory.category?.name}
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  inWishlist={wishlistProductIds.has(product.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: 7, background: '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: page === 1 ? '#CCC' : '#000', opacity: page === 1 ? 0.5 : 1 }}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ padding: '8px 14px', border: `1px solid ${page === p ? '#CA2A31' : '#E0E0E0'}`, borderRadius: 7, background: page === p ? '#CA2A31' : '#FFF', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: page === p ? '#FFF' : '#000', fontWeight: page === p ? 700 : 400 }}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: 7, background: '#FFF', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: page === totalPages ? '#CCC' : '#000', opacity: page === totalPages ? 0.5 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
