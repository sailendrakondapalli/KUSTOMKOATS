import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Heart, ShoppingCart, ArrowRight, ArrowLeft, Share2, Star } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useRecentlyViewedStore } from '../store/recentlyViewedStore'
import { supabase } from '../lib/supabase'
import { formatINR } from '../utils/format'
import toast from 'react-hot-toast'

const isVideoUrl = (url) => url && /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToCart, items } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const { add: addRecentlyViewed } = useRecentlyViewedStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [addingCart, setAddingCart] = useState(false)
  const [related, setRelated] = useState([])

  const wishlisted = product ? isWishlisted(product.id) : false
  const inCart = product ? items.some(i => i.product_id === product.id) : false

  useEffect(() => {
    setLoading(true)
    setImgIdx(0)
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setLoading(false); return }
        setProduct(data)
        setLoading(false)
        
        // Add to recently viewed if function exists
        if (addRecentlyViewed && typeof addRecentlyViewed === 'function') {
          addRecentlyViewed(data)
        }
        
        // Load recommended products with fallback strategy
        const loadRecommended = async () => {
          console.log('Loading recommended products for:', data.name, 'Category:', data.category)
          
          // Priority 1: Same category products
          const { data: sameCat, error: err1 } = await supabase.from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(8)
          
          console.log('Same category results:', sameCat, 'Error:', err1)
          let recommended = sameCat || []
          
          // Priority 2: If less than 4 from same category, get from other categories
          if (recommended.length < 4) {
            const { data: others, error: err2 } = await supabase.from('products')
              .select('*')
              .neq('id', id)
              .limit(8 - recommended.length)
            
            console.log('Other products results:', others, 'Error:', err2)
            if (others && others.length > 0) {
              recommended = [...recommended, ...others]
            }
          }
          
          console.log('Final recommended products:', recommended.length, recommended)
          setRelated(recommended)
        }
        
        loadRecommended()
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-lg" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Product not found</p>
        <button onClick={() => navigate('/products')} className="mt-4 px-6 py-2 rounded-lg text-sm font-semibold" style={{ background: "#FF0000", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
          Browse Products
        </button>
      </div>
    )
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['/product-fallback.webp']

  const currentMedia = images[imgIdx]
  const isCurrentVideo = isVideoUrl(currentMedia)

  const tags = [
    { label: product.category, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
    ...(product.tags || []).slice(0, 3).map((t, i) => {
      const palettes = [
        { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
        { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' },
        { bg: 'bg-black/5', border: 'border-black/10', text: 'text-black' },
      ]
      const p = palettes[i % palettes.length]
      return { label: t, ...p }
    }),
  ]

  return (
    <>
      <Helmet>
        <title>{product.name} - Buy Online | Kustom Koats</title>
        <meta name="description" content={`Buy ${product.name} online. ${product.description ? product.description.slice(0, 140) : `Premium ${product.category} automotive pearl from Kustom Koats.`} ₹${product.price}. Fast shipping available.`} />
        <meta name="keywords" content={`${product.name}, buy ${product.category}, automotive pearls, ${product.tags?.join(', ')}, car paint pearls india`} />
        <link rel="canonical" href={`https://www.kustomkoats.com/products/${product.id}`} />
        <meta property="og:title" content={`${product.name} - Kustom Koats`} />
        <meta property="og:description" content={product.description || `Premium ${product.category} automotive pearl. High-quality finish for custom automotive applications.`} />
        <meta property="og:image" content={product.images?.[0] || 'https://www.kustomkoats.com/og-image.png'} />
        <meta property="og:url" content={`https://www.kustomkoats.com/products/${product.id}`} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="INR" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.images || [],
          "description": product.description || `Premium ${product.category} automotive pearl`,
          "sku": product.custom_id || product.id,
          "brand": { "@type": "Brand", "name": "Kustom Koats" },
          "offers": {
            "@type": "Offer",
            "url": `https://www.kustomkoats.com/products/${product.id}`,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "Kustom Koats" }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "1"
          }
        })}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20 py-12" style={{ background: "#FFFFFF" }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-8" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
          <Link to="/" className="hover:text-[#FF0000] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop/xtreme-kolorz" className="hover:text-[#FF0000] transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop/xtreme-kolorz?category=${encodeURIComponent(product.category)}`} className="hover:text-[#FF0000] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="truncate max-w-[200px]" style={{ color: "#333333" }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - media */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F8F8F8] border border-gray-200">
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
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all">
                    <ArrowLeft size={18} style={{ color: "#000000" }} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all">
                    <ArrowRight size={18} style={{ color: "#000000" }} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-[#FF0000] shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}>
                    {isVideoUrl(img) ? (
                      <video src={img} muted playsInline className="w-full h-full object-cover bg-[#F8F8F8]" />
                    ) : (
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={e => { e.target.src = '/product-fallback.webp' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - info */}
          <div>
            <p className="text-[#FF0000] text-xs uppercase tracking-[0.15em] font-bold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              {product.category}
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
              {product.name}
            </h1>
            {product.custom_id && (
              <p className="text-gray-400 text-xs font-mono mb-4" style={{ fontFamily: "'Courier New', monospace" }}>
                SKU: {product.custom_id}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-[#FF0000]">
                {Array(5).fill(0).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-gray-500 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                (Automotive Grade Quality)
              </span>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-baseline gap-4 mb-2">
                <p className="text-4xl font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                  {formatINR(product.price)}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <p className="text-xl text-gray-400 line-through" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {formatINR(product.original_price)}
                    </p>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                      SAVE {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm font-medium" style={{ color: product.delivery_charge ? "#666666" : "#16a34a", fontFamily: "'Inter', sans-serif" }}>
                {product.delivery_charge
                  ? `+ ₹${product.delivery_charge} delivery charge`
                  : "✓ Free Delivery"}
              </p>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                  Product Description
                </h3>
                <p className="text-gray-700 text-base leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants / Stock */}
            <div className="grid gap-4 mb-6">
              {product.size && (
                <div className="bg-[#F8F8F8] rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    Available Variants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.size.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="px-4 py-2 bg-white border-2 border-gray-300 text-sm font-medium rounded-lg hover:border-[#FF0000] transition-colors cursor-pointer"
                        style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-[#F8F8F8] rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                  Availability
                </p>
                <p className={`font-bold text-base ${(product.stock ?? 1) > 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                  {(product.stock ?? 1) > 0
                    ? product.stock < 10 ? `Only ${product.stock} left in stock!` : '✓ In Stock'
                    : '✗ Out of Stock'}
                </p>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(t => (
                  <span key={t.label} className={`text-xs px-3 py-1.5 rounded-full border font-semibold uppercase tracking-wider ${t.bg} ${t.border} ${t.text}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    {t.label}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-base uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  inCart ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-lg hover:shadow-xl'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {addingCart
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : inCart ? <><ArrowRight size={18} /> View Cart</> : <><ShoppingCart size={18} /> Add to Cart</>
                }
              </button>
              <button onClick={handleWishlist}
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  wishlisted ? 'bg-red-500 border-red-500 text-white scale-105' : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-400'
                }`}>
                <Heart size={20} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied!')
                  }
                }}
                className="w-14 h-14 rounded-lg border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:border-[#FF0000] hover:text-[#FF0000] transition-all flex-shrink-0">
                <Share2 size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200">
              {[
                { icon: '✓', label: 'Automotive Grade' },
                { icon: '✓', label: product.delivery_charge ? `₹${product.delivery_charge} Delivery` : 'Free Shipping' },
                { icon: '✓', label: '100% Authentic' },
              ].map(b => (
                <div key={b.label} className="bg-[#F8F8F8] border border-gray-200 rounded-lg py-3 px-2 text-center">
                  <p className="text-[#FF0000] text-xl font-bold mb-1">{b.icon}</p>
                  <p className="text-xs font-medium" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    {b.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 pt-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
                RECOMMENDED FOR YOU
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => (
                <Link key={p.id} to={`/products/${p.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#FF0000] hover:shadow-xl transition-all">
                  <div className="aspect-square bg-[#F8F8F8] overflow-hidden relative">
                    {isVideoUrl(p.images?.[0]) ? (
                      <video src={p.images[0]} muted loop playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <img src={p.images?.[0]} alt={p.name} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={e => { e.target.src = '/product-fallback.webp' }} />
                    )}
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#FF0000] text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {p.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-[#FF0000] transition-colors"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      {p.name}
                    </p>
                    <p className="text-base font-bold" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
                      {formatINR(p.price)}
                    </p>
                    {p.original_price && p.original_price > p.price && (
                      <p className="text-xs text-gray-400 line-through mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {formatINR(p.original_price)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                to={`/shop/xtreme-kolorz?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                style={{ 
                  background: "#FF0000", 
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif" 
                }}
              >
                View All {product.category} Products <ArrowRight size={20} />
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
