import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useWholesaler } from '../hooks/useWholesaler'
import { formatINR } from '../utils/format'
import { isVideoUrl } from '../services/storageService'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotal } = useCartStore()
  const { user } = useAuthStore()
  const { toggleWishlist } = useWishlistStore()
  const navigate = useNavigate()
  
  // Check if user is an approved wholesaler
  const { isWholesaler } = useWholesaler()

  // Selected item IDs (default: all selected)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  // Whenever items change, add any new item to selection
  useEffect(() => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      items.forEach(i => { const key = i.id || i.product_id; if (!next.has(key)) next.add(key) })
      // Remove keys that no longer exist
      ;[...next].forEach(k => { if (!items.find(i => (i.id || i.product_id) === k)) next.delete(k) })
      return next
    })
  }, [items])

  const toggleItem = (key) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const allSelected = items.length > 0 && selectedIds.size === items.length
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(items.map(i => i.id || i.product_id)))
  }

  const selectedItems = items.filter(i => selectedIds.has(i.id || i.product_id))
  
  // Calculate total using wholesale prices for wholesalers
  const selectedTotal = selectedItems.reduce((s, i) => {
    const product = i.products || {}
    const price = isWholesaler && product.wholesale_price 
      ? product.wholesale_price 
      : product.price || 0
    return s + price * i.quantity
  }, 0)
  
  const hasOutOfStock = selectedItems.some(i => i.products?.stock === 0)

  // Cart abandonment reminder after 3 minutes of inactivity
  useEffect(() => {
    if (items.length === 0) return
    const timer = setTimeout(() => {
      const phone = "919043700776"
      const msg = encodeURIComponent("Hi! You have items waiting in your cart at Royal Hoof ?? Complete your order before they sell out!")
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Still thinking? ??</p>
            <p className="text-xs text-gray-400">Your cart items might sell out soon!</p>
            <div className="flex gap-2 mt-1">
              <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white text-xs rounded-lg font-medium">
                Chat with us
              </a>
              <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg">
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 10000, id: 'cart-reminder' }
      )
    }, 3 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [items.length])

  const handleRemove = async (item) => {
    await removeFromCart(item.id || item.product_id, user?.id)
    toast.success('Removed from cart')
  }

  const handleSaveLater = async (item) => {
    if (!user) { toast.error('Please login to save to wishlist'); return }
    const product = item.products
    if (!product) return
    await toggleWishlist(product, user.id)
    await removeFromCart(item.id || item.product_id, user?.id)
    toast.success('Moved to wishlist!')
  }

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta
    await updateQuantity(item.id || item.product_id, newQty, user?.id)
  }

  const handleCheckout = () => {
    if (selectedItems.length === 0) { toast.error('Select at least one item to checkout'); return }
    navigate('/checkout', { state: { selectedItems } })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
        <ShoppingBag size={64} className="text-black mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: 'Georgia, serif' }}>Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Discover our collection</p>
        <Link to="/products" className="px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-black mb-6" style={{ fontFamily: 'Georgia, serif' }}>Shopping Cart</h1>

      {/* Select all row */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <input
          type="checkbox"
          id="select-all"
          checked={allSelected}
          onChange={toggleAll}
          className="w-4 h-4 accent-black cursor-pointer"
        />
        <label htmlFor="select-all" className="text-sm text-gray-700 cursor-pointer select-none">
          {allSelected ? 'Deselect all' : `Select all (${items.length})`}
        </label>
        {selectedIds.size > 0 && selectedIds.size < items.length && (
          <span className="text-xs text-black font-medium">{selectedIds.size} of {items.length} selected</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map(item => {
              const product = item.products || {}
              const mediaUrl = product.images?.[0]
              const fallback = '/Horse Riding-fallback.webp'
              const key = item.id || item.product_id
              const isSelected = selectedIds.has(key)
              
              // Calculate display price based on wholesaler status
              const displayPrice = isWholesaler && product.wholesale_price 
                ? product.wholesale_price 
                : product.price || 0
              const hasWholesaleDiscount = isWholesaler && product.wholesale_price && product.wholesale_price < product.price
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex gap-4 bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${
                    isSelected ? 'border-black' : 'border-gray-300 opacity-60'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(key)}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                  </div>

                  <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                    {mediaUrl && isVideoUrl(mediaUrl) ? (
                      <video
                        src={mediaUrl}
                        muted
                        playsInline
                        loop
                        autoPlay
                        className="w-20 h-20 object-cover rounded-lg bg-black"
                      />
                    ) : (
                      <img
                        src={mediaUrl || fallback}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={e => { e.target.src = fallback }}
                      />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product_id}`}>
                      <h3 className="text-black text-sm font-semibold hover:text-gray-700 transition-colors line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-xs mt-1 font-medium">{product.category}</p>
                    {hasWholesaleDiscount && (
                      <p className="text-blue-600 text-xs mt-1 font-semibold">✓ Wholesale Price Applied</p>
                    )}
                    {product.stock === 0 && <p className="text-red-500 text-xs mt-1">⚠ Out of stock</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleQty(item, -1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all">
                          <Minus size={12} />
                        </button>
                        <span className="text-black text-sm w-6 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => handleQty(item, 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {hasWholesaleDiscount && (
                            <p className="text-gray-400 text-[0.625rem] line-through">{formatINR(product.price * item.quantity)}</p>
                          )}
                          <span className="text-black font-bold text-sm">{formatINR(displayPrice * item.quantity)}</span>
                        </div>
                        <button onClick={() => handleRemove(item)} title="Remove" className="text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleSaveLater(item)}
                      className="mt-2 text-xs text-gray-600 hover:text-black transition-colors flex items-center gap-1">
                      <Heart size={11} /> Save for later
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 h-fit sticky top-20 shadow-sm">
          <h2 className="text-black font-semibold mb-4">Order Summary</h2>

          {selectedItems.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No items selected</p>
          ) : (
            <div className="space-y-3 mb-4">
              {selectedItems.map(item => {
                const product = item.products || {}
                const displayPrice = isWholesaler && product.wholesale_price 
                  ? product.wholesale_price 
                  : product.price || 0
                return (
                  <div key={item.id || item.product_id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate mr-2">{product.name} × {item.quantity}</span>
                    <span className="text-black shrink-0 font-medium">{formatINR(displayPrice * item.quantity)}</span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="border-t-2 border-gray-200 pt-4 mb-6">
            <div className="flex justify-between">
              <span className="text-black font-semibold">Total</span>
              <span className="text-black font-bold text-lg">{formatINR(selectedTotal)}</span>
            </div>
            {selectedItems.length > 0 && selectedItems.length < items.length && (
              <p className="text-gray-500 text-xs mt-1">{selectedItems.length} of {items.length} items selected</p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={hasOutOfStock || selectedItems.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
          {hasOutOfStock && <p className="text-red-500 text-xs text-center mt-2">Remove out-of-stock items to proceed</p>}
        </div>
      </div>
    </div>
  )
}
