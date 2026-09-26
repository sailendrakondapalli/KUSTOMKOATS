import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, ArrowRight, CheckCircle, MapPin, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useWholesaler } from '../hooks/useWholesaler'
import { formatINR } from '../utils/format'
import toast from 'react-hot-toast'

const isVideo = (url) => url && /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)
const FALLBACK_IMG = '/categories/image.png'

function TagBadges({ tags }) {
  if (!tags?.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {tags.includes('certified') && (
        <span className="flex items-center gap-1 text-[0.625rem] font-semibold px-2 py-0.5 rounded-sm bg-green-100 text-green-700 border border-green-200"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <CheckCircle size={10} /> Certified
        </span>
      )}
      {tags.includes('new') && (
        <span className="flex items-center gap-1 text-[0.625rem] font-semibold px-2 py-0.5 rounded-sm bg-red-100 text-[#CA2A31] border border-red-200"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <Sparkles size={10} /> New
        </span>
      )}
      {tags.includes('rare') && (
        <span className="flex items-center gap-1 text-[0.625rem] font-semibold px-2 py-0.5 rounded-sm bg-purple-100 text-purple-700 border border-purple-200"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <Sparkles size={10} /> Rare
        </span>
      )}
    </div>
  )
}

/* --- GRID CARD --- */
function GridCard({ product, inCart, wishlisted, onAddToCart, onWishlist, isWholesaler }) {
  const media = product.images?.[0] || FALLBACK_IMG
  const mediaIsVideo = isVideo(media)
  const origPrice = product.original_price || product.compare_price
  
  // Determine price to display based on wholesaler status
  const displayPrice = isWholesaler && product.wholesale_price 
    ? product.wholesale_price 
    : product.price
  
  // Check if there's a wholesale discount
  const hasWholesaleDiscount = isWholesaler && product.wholesale_price && product.wholesale_price < product.price

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full hover:border-[#CA2A31] hover:shadow-lg transition-all"
    >
      <Link to={`/products/${product.id}`} className="flex flex-col flex-1">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square bg-[#F8F8F8] flex-shrink-0">
          {mediaIsVideo ? (
            <video src={media} muted loop playsInline autoPlay
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <img src={media} alt={product.name} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={e => { e.target.src = FALLBACK_IMG }} />
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xs font-semibold bg-black px-4 py-2 rounded"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                Out of Stock
              </span>
            </div>
          )}

          {/* Wholesale Badge */}
          {isWholesaler && hasWholesaleDiscount && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-blue-600 text-white text-[0.625rem] px-2 py-1 rounded font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Wholesale Price
            </span>
          )}
          
          {/* Certified Badge */}
          {!isWholesaler && product.tags?.includes('certified') && (
            <span className="absolute top-3 left-3 flex items-center gap-1 bg-green-600 text-white text-[0.625rem] px-2 py-1 rounded font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              <CheckCircle size={10} /> Certified
            </span>
          )}
          
          {/* New Badge */}
          {!isWholesaler && !product.tags?.includes('certified') && product.tags?.includes('new') && (
            <span className="absolute top-3 left-3 bg-[#CA2A31] text-white text-[0.625rem] px-2 py-1 rounded font-bold"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              New
            </span>
          )}

          {/* Discount Badge */}
          {origPrice && origPrice > product.price && (
            <span className="absolute top-3 right-12 bg-green-600 text-white text-[0.625rem] font-bold px-2 py-1 rounded"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              -{Math.round(((origPrice - product.price) / origPrice) * 100)}%
            </span>
          )}

          {/* Wishlist Button */}
          <button onClick={onWishlist}
            className={`absolute top-3 right-3 p-2 rounded transition-all duration-300 ${
              wishlisted 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'
            }`}>
            <Heart size={14} strokeWidth={1.5} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          <p className="text-[0.625rem] text-[#CA2A31] mb-2 uppercase tracking-[0.15em] font-semibold"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            {product.category}
          </p>
          
          {/* Title */}
          <h3 className="text-sm font-medium line-clamp-2 mb-3 group-hover:text-[#CA2A31] transition-colors leading-snug flex-1"
            style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}>
            {product.name}
          </h3>
          
          {/* Tags */}
          <div className="mb-3">
            <TagBadges tags={product.tags?.filter(t => t !== 'certified')} />
          </div>
          
          {/* Pricing */}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base" style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}>
                {formatINR(displayPrice)}
              </span>
              {hasWholesaleDiscount && (
                <span className="text-gray-400 text-xs line-through">
                  {formatINR(product.price)}
                </span>
              )}
              {!hasWholesaleDiscount && origPrice && origPrice > product.price && (
                <span className="text-gray-400 text-xs line-through">
                  {formatINR(origPrice)}
                </span>
              )}
            </div>
            <p className="text-[0.625rem] mt-1" 
              style={{ 
                color: product.delivery_charge ? "#666666" : "#16a34a",
                fontFamily: "'Inter', sans-serif" 
              }}>
              {product.delivery_charge ? `+ ₹${product.delivery_charge} delivery` : "Free Delivery"}
            </p>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <button onClick={onAddToCart} disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider ${
            inCart
              ? 'bg-green-700 hover:bg-green-600 text-white'
              : 'bg-[#CA2A31] hover:bg-[#CC0000] text-white'
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}>
          {inCart ? (
            <><ArrowRight size={14} /> View Cart</>
          ) : (
            <><ShoppingCart size={14} /> Add to Cart</>
          )}
        </button>
      </div>
    </motion.div>
  )
}

/* --- LIST CARD --- */
function ListCard({ product, inCart, wishlisted, onAddToCart, onWishlist, isWholesaler }) {
  const media = product.images?.[0] || FALLBACK_IMG
  const mediaIsVideo = isVideo(media)
  const origPrice = product.original_price || product.compare_price
  const inStock = product.stock > 0
  
  // Determine price to display based on wholesaler status
  const displayPrice = isWholesaler && product.wholesale_price 
    ? product.wholesale_price 
    : product.price
  
  // Check if there's a wholesale discount
  const hasWholesaleDiscount = isWholesaler && product.wholesale_price && product.wholesale_price < product.price

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white border border-gray-200 rounded-lg transition-all duration-300 overflow-hidden hover:border-[#CA2A31] hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <div className="flex items-stretch gap-4 p-4">
          {/* Image */}
          <div className="relative flex-shrink-0 w-28 h-28 rounded overflow-hidden bg-[#F8F8F8]">
            {mediaIsVideo ? (
              <video src={media} muted loop playsInline autoPlay className="w-full h-full object-cover" />
            ) : (
              <img src={media} alt={product.name} loading="lazy"
                className="w-full h-full object-cover"
                onError={e => { e.target.src = FALLBACK_IMG }} />
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-[0.625rem] font-bold text-white bg-black px-2 py-1 rounded"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  OOS
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="flex items-center gap-2 mb-1">
              {product.custom_id && (
                <span className="font-mono text-[0.625rem] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200"
                  style={{ fontFamily: "'Courier New', monospace" }}>
                  {product.custom_id}
                </span>
              )}
              <span className="text-[0.625rem] text-[#CA2A31] font-semibold uppercase tracking-wider px-2 py-0.5 bg-red-50 rounded border border-red-100"
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {product.category}
              </span>
              {isWholesaler && hasWholesaleDiscount && (
                <span className="text-[0.625rem] text-blue-600 font-semibold uppercase tracking-wider px-2 py-0.5 bg-blue-50 rounded border border-blue-100"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  Wholesale
                </span>
              )}
            </div>
            
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-[#CA2A31] transition-colors leading-tight mb-2"
              style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}>
              {product.name}
            </h3>
            
            {product.size && (
              <p className="text-gray-600 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Size: <span className="font-medium text-black">{product.size} mm</span>
              </p>
            )}
            
            <TagBadges tags={product.tags} />
            
            <div className="flex items-center gap-3 mt-2">
              <span className="font-semibold text-base" style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}>
                {formatINR(displayPrice)}
              </span>
              {hasWholesaleDiscount && (
                <span className="text-gray-400 text-xs line-through">
                  {formatINR(product.price)}
                </span>
              )}
              {!hasWholesaleDiscount && origPrice && origPrice > product.price && (
                <>
                  <span className="text-gray-400 text-xs line-through">
                    {formatINR(origPrice)}
                  </span>
                  <span className="text-green-600 text-[0.625rem] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                    -{Math.round(((origPrice - product.price) / origPrice) * 100)}%
                  </span>
                </>
              )}
              <span className={`flex items-center gap-1.5 text-[0.625rem] font-semibold ml-auto ${
                inStock ? 'text-green-600' : 'text-[#CA2A31]'
              }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-600' : 'bg-[#CA2A31]'}`} />
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <p className="text-[0.625rem] mt-1" 
              style={{ 
                color: product.delivery_charge ? "#666666" : "#16a34a",
                fontFamily: "'Inter', sans-serif" 
              }}>
              {product.delivery_charge ? `+ ₹${product.delivery_charge} delivery` : "Free Delivery"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col items-center justify-between py-1 gap-2 pl-2">
            <button onClick={onWishlist}
              className={`p-2 rounded transition-all duration-300 ${
                wishlisted 
                  ? 'bg-red-100 text-red-500' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}>
              <Heart size={16} strokeWidth={1.5} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onAddToCart} disabled={product.stock === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap uppercase tracking-wider ${
                inCart
                  ? 'bg-green-700 hover:bg-green-600 text-white'
                  : 'bg-[#CA2A31] hover:bg-[#CC0000] text-white'
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {inCart ? (
                <><ArrowRight size={12} /> Cart</>
              ) : (
                <><ShoppingCart size={12} /> Add</>
              )}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* --- MAIN EXPORT --- */
export default function ProductCard({ product, layout = 'grid' }) {
  const { user } = useAuthStore()
  const { addToCart, items } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const navigate = useNavigate()
  
  // Check if user is an approved wholesaler
  const { isWholesaler } = useWholesaler()

  const wishlisted = isWishlisted(product.id)
  const inCart = items.some(i => i.product_id === product.id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (inCart) { navigate('/cart'); return }
    if (!user) { toast.error('Please login to add to cart'); return }
    try { 
      await addToCart(product, user?.id)
      toast.success('Added to cart!') 
    } catch (err) { 
      toast.error(err.message || 'Failed to add to cart') 
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to save to wishlist'); return }
    try {
      const added = await toggleWishlist(product, user?.id)
      toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist')
    } catch (err) { 
      toast.error(err.message || 'Failed to update wishlist') 
    }
  }

  const shared = { product, inCart, wishlisted, onAddToCart: handleAddToCart, onWishlist: handleWishlist, isWholesaler }
  return layout === 'list' ? <ListCard {...shared} /> : <GridCard {...shared} />
}
