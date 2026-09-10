import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ColorCard({ product, colorName, category }) {
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product) {
      toast.error('This color is not available for purchase yet')
      return
    }

    try {
      await addToCart(product, user?.id)
      toast.success(`Added ${product.name} to cart`)
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  const displayName = product?.name || colorName
  const displayCategory = product?.category || category
  const productId = product?.id || product?.custom_id
  const imageUrl = product?.images?.[0] || 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&q=80'

  return (
    <Link to={product ? `/products/${productId}` : '#'} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="color-card rounded-lg overflow-hidden group"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&q=80'
            }}
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <div className="flex gap-3">
              {product && (
                <button
                  onClick={handleAddToCart}
                  className="btn-icon bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-all transform hover:scale-110"
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={18} />
                </button>
              )}
              <div className="btn-icon bg-white/10 backdrop-blur-sm text-white p-3 rounded-full transition-all transform hover:scale-110">
                <Eye size={18} />
              </div>
            </div>
          </div>

          {/* Category badge */}
          {displayCategory && (
            <div className="absolute top-3 right-3">
              <span className="eyebrow text-[10px] bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                {displayCategory}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-base mb-1 line-clamp-1 group-hover:text-red-500 transition-colors">
            {displayName}
          </h3>
          
          {product?.price && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-bold text-red-500">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.stock !== undefined && (
                <span className={`text-xs ${product.stock > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
            </div>
          )}
          
          {!product && (
            <p className="text-gray-500 text-sm mt-2">
              Contact for availability
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
