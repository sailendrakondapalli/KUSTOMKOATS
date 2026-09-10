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
        addRecentlyViewed(data)
        // Load related products same category
        supabase.from('products').select('*').eq('category', data.category).neq('id', id).limit(4)
          .then(({ data: rel }) => setRelated(rel || []))
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

      <div className="max-w-7xl mx-auto px-4 py-8" style={{ background: "#FFFFFF" }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
          <Link to="/" className="hover:text-[#FF0000] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#FF0000] transition-colors">All Products</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#FF0000] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="truncate max-w-[160px]" style={{ color: "#333333" }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left - media */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1A0A02] border border-[#5C3015]">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all">
                    <ArrowLeft size={14} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all">
                    <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-[#FF0000]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    {isVideoUrl(img) ? (
                      <video src={img} muted playsInline className="w-full h-full object-cover bg-black" />
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
            <p className="text-[#D97706] text-xs uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold text-[#C8860A] mb-3" style={{ fontFamily: 'Georgia, serif' }}>{product.name}</h1>
            {product.custom_id && <p className="text-[#DDB87A]/60 text-xs font-mono mb-2">ID: {product.custom_id}</p>}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#D97706]">{Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <span className="text-[#DDB87A]/60 text-xs">(Authentic &amp; Certified)</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-[#D97706]">{formatINR(product.price)}</p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-xl text-gray-400 line-through">{formatINR(product.original_price)}</p>
                )}
                {product.original_price && product.original_price > product.price && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                )}
              </div>
              <p className="text-sm mt-1" style={{ color: product.delivery_charge ? "#8B6A4A" : "#16a34a" }}>
                {product.delivery_charge
                  ? `+ ?${product.delivery_charge} delivery charge`
                  : "?? Free Delivery"}
              </p>
            </div>
            <p className="text-[#DDB87A]/80 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Variants / Stock */}
            <div className="grid gap-3 mb-6 text-sm">
              {product.size && (
                <div className="bg-[#2A1408] rounded-lg p-3 border border-[#5C3015]">
                  <p className="text-[#DDB87A]/60 text-xs mb-2">Available Variants</p>
                  <div className="flex flex-wrap gap-2">
                    {product.size.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="px-3 py-1 bg-[#C8860A]/10 border border-[#C8860A]/30 text-[#C8860A] text-xs rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-[#2A1408] rounded-lg p-3 border border-[#5C3015]">
                <p className="text-[#DDB87A]/60 text-xs mb-1">Stock</p>
                <p className={`font-medium text-sm ${(product.stock ?? 1) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(product.stock ?? 1) > 0
                    ? product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'
                    : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(t => (
                  <span key={t.label} className={`text-xs px-3 py-1 rounded-full border font-medium ${t.bg} ${t.border} ${t.text}`}>
                    {t.label}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  inCart ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-[#C8860A] hover:bg-[#E5A020] text-[#1A0A02]'
                }`}>
                {addingCart
                  ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : inCart ? <><ArrowRight size={16} /> Go to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>
                }
              </button>
              <button onClick={handleWishlist}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-[#5C3015] text-[#DDB87A] hover:border-red-400 hover:text-red-400'
                }`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied!')
                  }
                }}
                className="w-12 h-12 rounded-xl border-2 border-[#5C3015] text-[#DDB87A] flex items-center justify-center hover:border-[#C8860A] hover:text-[#C8860A] transition-all flex-shrink-0">
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '??', label: 'Lab Certified' },
                { icon: '??', label: product.delivery_charge ? `?${product.delivery_charge} Delivery` : 'Free Delivery' },
                { icon: '??', label: '7-Day Returns' },
              ].map(b => (
                <div key={b.label} className="bg-[#2A1408] border border-[#5C3015] rounded-xl py-2.5 px-1">
                  <p className="text-lg mb-0.5">{b.icon}</p>
                  <p className="text-[#DDB87A] text-xs font-medium">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-[#C8860A] mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              More {product.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/products/${p.id}`}
                  className="group bg-[#2A1408] border border-[#5C3015] rounded-2xl overflow-hidden hover:border-[#C8860A]/60 hover:shadow-[0_4px_20px_rgba(200,134,10,0.15)] transition-all">
                  <div className="aspect-square bg-[#1A0A02] overflow-hidden">
                    {isVideoUrl(p.images?.[0]) ? (
                      <video src={p.images[0]} muted loop playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <img src={p.images?.[0]} alt={p.name} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={e => { e.target.src = '/product-fallback.webp' }} />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-semibold line-clamp-2 group-hover:text-[#C8860A] transition-colors">{p.name}</p>
                    <p className="text-[#C8860A] font-bold mt-1">{formatINR(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
