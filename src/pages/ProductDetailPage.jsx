import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Heart, ShoppingCart, ArrowRight, ArrowLeft, Share2, Star } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useRecentlyViewedStore } from '../store/recentlyViewedStore'
import { useWholesaler } from '../hooks/useWholesaler'
import { supabase } from '../lib/supabase'
import { formatINR } from '../utils/format'
import TechnicalBar from '../components/TechnicalBar'
import TechnicalSpecs from '../components/TechnicalSpecs'
import toast from 'react-hot-toast'

const isVideoUrl = (url) => url && /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToCart, items } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const { add: addRecentlyViewed } = useRecentlyViewedStore()
  
  // Check if user is an approved wholesaler
  const { isWholesaler } = useWholesaler()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [addingCart, setAddingCart] = useState(false)
  const [related, setRelated] = useState([])
  const [techBars, setTechBars] = useState([])
  const [techSpecs, setTechSpecs] = useState([])
  const [techLoading, setTechLoading] = useState(false)

  const wishlisted = product ? isWishlisted(product.id) : false
  const inCart = product ? items.some(i => i.product_id === product.id) : false
  
  // Determine price to display based on wholesaler status
  const displayPrice = product && isWholesaler && product.wholesale_price 
    ? product.wholesale_price 
    : product?.price || 0
  
  // Check if there's a wholesale discount
  const hasWholesaleDiscount = product && isWholesaler && product.wholesale_price && product.wholesale_price < product.price

  useEffect(() => {
    setLoading(true)
    setImgIdx(0)
    setTechBars([])
    setTechSpecs([])

    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setLoading(false); return }
        setProduct(data)
        setLoading(false)

        if (addRecentlyViewed && typeof addRecentlyViewed === 'function') {
          addRecentlyViewed(data)
        }

        // Fetch technical details
        const loadTechDetails = async () => {
          setTechLoading(true)
          try {
            const [barsRes, specsRes] = await Promise.all([
              supabase
                .from('product_technical_bars')
                .select('*')
                .eq('product_id', data.id)
                .order('sort_order', { ascending: true }),
              supabase
                .from('product_specifications')
                .select('*')
                .eq('product_id', data.id)
                .order('sort_order', { ascending: true }),
            ])

            if (barsRes.error) console.error('techBars fetch error:', barsRes.error.message)
            if (specsRes.error) console.error('techSpecs fetch error:', specsRes.error.message)

            const bars = barsRes.data || []
            const specs = specsRes.data || []

            console.log('Tech bars fetched:', bars.length, 'for product_id:', data.id)
            console.log('Tech specs fetched:', specs.length, 'for product_id:', data.id)

            setTechBars(bars)
            setTechSpecs(specs)
          } catch (err) {
            console.error('loadTechDetails error:', err.message)
          } finally {
            setTechLoading(false)
          }
        }
        loadTechDetails()

        // Fetch related products
        const loadRelated = async () => {
          const { data: sameCat } = await supabase
            .from('products').select('*')
            .eq('category', data.category).neq('id', id).limit(8)
          let recommended = sameCat || []
          if (recommended.length < 4) {
            const { data: others } = await supabase
              .from('products').select('*').neq('id', id).limit(8 - recommended.length)
            if (others?.length) recommended = [...recommended, ...others]
          }
          setRelated(recommended)
        }
        loadRelated()
      })
  }, [id])

  const handleAddToCart = async () => {
    if (inCart) { navigate('/cart'); return }
    if (!user) { toast.error('Please login to add to cart'); navigate('/login'); return }
    setAddingCart(true)
    try {
      await addToCart(product, user.id)
      toast.success('Added to cart!')
    } catch (e) {
      toast.error(e.message || 'Failed to add to cart')
    } finally {
      setAddingCart(false)
    }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login to save to wishlist'); return }
    try {
      const added = await toggleWishlist(product, user.id)
      toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist')
    } catch (e) {
      toast.error(e.message || 'Failed to update wishlist')
    }
  }

  const handleBuyNow = () => {
    navigate('/checkout', { state: { buyNow: { product, quantity: 1 } } })
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#FFFFFF', paddingTop: '80px' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
            <div className="space-y-4 py-8">
              <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: '#FFFFFF', paddingTop: '80px' }}>
        <p className="text-lg mb-4" style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
          Product not found
        </p>
        <button onClick={() => navigate('/products')}
          className="px-6 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#CA2A31', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
          Browse Products
        </button>
      </div>
    )
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images : ['/product-fallback.webp']
  const currentMedia = images[imgIdx]
  const isCurrentVideo = isVideoUrl(currentMedia)
  const hasTechDetails = techBars.length > 0 || techSpecs.length > 0

  const tags = [
    { label: product.category, bg: 'bg-red-50', border: 'border-red-200', text: 'text-[#CA2A31]' },
    ...(product.tags || []).slice(0, 3).map((t, i) => {
      const palettes = [
        { bg: 'bg-red-50', border: 'border-red-200', text: 'text-[#CA2A31]' },
        { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
        { bg: 'bg-black/5', border: 'border-black/10', text: 'text-black' },
      ]
      return { label: t, ...palettes[i % palettes.length] }
    }),
  ]

  return (
    <>
      <Helmet>
        <title>{product.name} - Buy Online | Kustom Koats</title>
        <meta name="description" content={`Buy ${product.name} online. ${product.description ? product.description.slice(0, 140) : `Premium ${product.category} from Kustom Koats.`} ₹${product.price}.`} />
        <link rel="canonical" href={`https://www.kustomkoats.com/products/${product.id}`} />
        <meta property="og:title" content={`${product.name} - Kustom Koats`} />
        <meta property="og:image" content={product.images?.[0] || 'https://www.kustomkoats.com/og-image.png'} />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '64px' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20 py-10"
        style={{ background: '#FFFFFF' }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-8"
          style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
          <Link to="/" className="hover:text-[#CA2A31] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#CA2A31] transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#CA2A31] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="truncate max-w-[200px]" style={{ color: '#333333' }}>{product.name}</span>
        </div>

        {/* ── PRODUCT MAIN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left — media */}
          <div className="lg:sticky lg:top-24 lg:h-fit space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden"
              style={{ background: '#F8F8F8', border: '1px solid #E5E5E5' }}>
              <AnimatePresence mode="wait">
                <motion.div key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  {isCurrentVideo ? (
                    <video src={currentMedia} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentMedia} alt={product.name} className="w-full h-full object-cover"
                      onError={e => { e.target.src = '/product-fallback.webp' }} />
                  )}
                </motion.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                    <ArrowLeft size={18} style={{ color: '#000000' }} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                    <ArrowRight size={18} style={{ color: '#000000' }} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-[#CA2A31] shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                    {isVideoUrl(img)
                      ? <video src={img} muted playsInline className="w-full h-full object-cover" />
                      : <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = '/product-fallback.webp' }} />
                    }
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div>
            <p className="text-[#CA2A31] text-xs uppercase tracking-[0.15em] font-bold mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}>{product.category}</p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Rajdhani', sans-serif", color: '#000000' }}>
              {product.name}
            </h1>
            {product.custom_id && (
              <p className="text-gray-400 text-xs font-mono mb-4">SKU: {product.custom_id}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-[#CA2A31]">
                {Array(5).fill(0).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-gray-500 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                (Automotive Grade Quality)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6" style={{ borderBottom: '1px solid #E5E5E5' }}>
              {isWholesaler && hasWholesaleDiscount && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    Wholesale Price
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-4 mb-2">
                <p className="text-4xl font-bold" style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                  {formatINR(displayPrice)}
                </p>
                {hasWholesaleDiscount && (
                  <>
                    <p className="text-xl text-gray-400 line-through" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatINR(product.price)}
                    </p>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                      SAVE {Math.round(((product.price - product.wholesale_price) / product.price) * 100)}%
                    </span>
                  </>
                )}
                {!hasWholesaleDiscount && product.original_price && product.original_price > product.price && (
                  <>
                    <p className="text-xl text-gray-400 line-through" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatINR(product.original_price)}
                    </p>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      SAVE {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm font-medium"
                style={{ color: product.delivery_charge ? '#666666' : '#16a34a', fontFamily: "'Inter', sans-serif" }}>
                {product.delivery_charge ? `+ ₹${product.delivery_charge} delivery charge` : '✓ Free Delivery'}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3"
                  style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                  Product Description
                </h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {product.size && (
              <div className="rounded-xl p-4 mb-4" style={{ background: '#F8F8F8', border: '1px solid #E5E5E5' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                  Available Variants
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.size.split(',').map(s => s.trim()).filter(Boolean).map(s => {
                    // Format size with proper units
                    const formatSize = (size) => {
                      const num = parseFloat(size)
                      if (isNaN(num)) return size
                      
                      // Convert to appropriate unit
                      if (num >= 1000) {
                        return `${num / 1000} Ltr`
                      } else if (num >= 1) {
                        return `${num} ml`
                      } else {
                        return `${num * 1000} ml`
                      }
                    }
                    
                    return (
                      <span key={s}
                        className="px-4 py-2 bg-white border-2 border-gray-300 text-sm font-medium rounded-lg hover:border-[#CA2A31] transition-colors cursor-pointer"
                        style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                        {formatSize(s)}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="rounded-xl p-4 mb-6" style={{ background: '#F8F8F8', border: '1px solid #E5E5E5' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>Availability</p>
              <p className={`font-bold text-base ${(product.stock ?? 1) > 0 ? 'text-green-600' : 'text-[#CA2A31]'}`}
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {(product.stock ?? 1) > 0
                  ? product.stock < 10 ? `Only ${product.stock} left in stock!` : '✓ In Stock'
                  : '✗ Out of Stock'}
              </p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(t => (
                  <span key={t.label}
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold uppercase tracking-wider ${t.bg} ${t.border} ${t.text}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t.label}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 mb-6">
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all disabled:opacity-40"
                style={{ background: '#CA2A31', color: '#FFFFFF', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 16px rgba(255,0,0,0.25)' }}>
                <ArrowRight size={18} /> Buy Now
              </button>
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={product.stock === 0 || addingCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all disabled:opacity-40 ${inCart ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-black hover:bg-gray-800 text-white'}`}
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  {addingCart
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : inCart ? <><ArrowRight size={18} /> View Cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
                </button>
                <button onClick={handleWishlist}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-400'}`}>
                  <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
                    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }
                  }}
                  className="w-14 h-14 rounded-xl border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:border-[#CA2A31] hover:text-[#CA2A31] transition-all flex-shrink-0">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6" style={{ borderTop: '1px solid #E5E5E5' }}>
              {[
                { icon: '✓', label: 'Automotive Grade' },
                { icon: '✓', label: product.delivery_charge ? `₹${product.delivery_charge} Delivery` : 'Free Shipping' },
                { icon: '✓', label: '100% Authentic' },
              ].map(b => (
                <div key={b.label} className="rounded-xl py-3 px-2 text-center"
                  style={{ background: '#F8F8F8', border: '1px solid #E5E5E5' }}>
                  <p className="text-[#CA2A31] text-xl font-bold mb-1">{b.icon}</p>
                  <p className="text-xs font-medium" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                    {b.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TECHNICAL DETAILS ── */}
        {(hasTechDetails || techLoading) && (
          <section className="mt-16 pt-12" style={{ borderTop: '2px solid #F0F0F0' }}>
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
                SPECIFICATIONS
              </p>
              <h2 className="text-3xl font-bold"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: '#000000' }}>
                Technical Details
              </h2>
            </div>

            {techLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: 10, padding: '16px 18px' }} className="animate-pulse">
                      <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                      <div className="h-2 bg-gray-100 rounded mb-3" />
                      <div className="flex justify-between">
                        <div className="h-2 bg-gray-100 rounded w-12" />
                        <div className="h-2 bg-gray-100 rounded w-12" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* LEFT — Bars */}
                {techBars.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-5"
                      style={{ color: '#888888', fontFamily: "'Inter', sans-serif" }}>
                      Performance Characteristics
                    </h3>
                    {techBars.map(bar => (
                      <TechnicalBar
                        key={bar.id}
                        title={bar.title}
                        labels={bar.labels || []}
                        selectedValue={bar.selected_value}
                      />
                    ))}
                  </div>
                )}

                {/* RIGHT — Specs */}
                {techSpecs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-5"
                      style={{ color: '#888888', fontFamily: "'Inter', sans-serif" }}>
                      Product Specifications
                    </h3>
                    <TechnicalSpecs specs={techSpecs} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className="mt-16 pt-16" style={{ borderTop: '1px solid #E5E5E5' }}>
            <div className="text-center mb-12">
              <p className="text-sm font-bold mb-3 tracking-wider uppercase"
                style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
                RECOMMENDED FOR YOU
              </p>
              <h2 className="text-3xl md:text-4xl font-bold"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: '#000000' }}>
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => (
                <Link key={p.id} to={`/products/${p.id}`}
                  className="group rounded-xl overflow-hidden transition-all hover:shadow-xl"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                  <div className="aspect-square overflow-hidden relative" style={{ background: '#F8F8F8' }}>
                    {isVideoUrl(p.images?.[0])
                      ? <video src={p.images[0]} muted loop playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <img src={p.images?.[0]} alt={p.name} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={e => { e.target.src = '/product-fallback.webp' }} />
                    }
                    <span className="absolute top-3 left-3 bg-white/90 text-[#CA2A31] text-xs font-bold px-3 py-1 rounded-full"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      {p.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-[#CA2A31] transition-colors"
                      style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                      {p.name}
                    </p>
                    <p className="text-base font-bold" style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
                      {formatINR(p.price)}
                    </p>
                    {p.original_price && p.original_price > p.price && (
                      <p className="text-xs text-gray-400 line-through mt-1">{formatINR(p.original_price)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to={`/products?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
                style={{ background: '#CA2A31', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
                View All {product.category} Products <ArrowRight size={20} />
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
