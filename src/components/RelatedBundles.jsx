import { useState, useEffect } from 'react'
import { Package, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function RelatedBundles({ productId }) {
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingBundle, setAddingBundle] = useState(null)
  const { addBundleToCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadRelatedBundles()
  }, [productId])

  const loadRelatedBundles = async () => {
    setLoading(true)
    try {
      // Fetch bundles related to this product
      const { data: productBundles, error: pbError } = await supabase
        .from('product_bundles')
        .select('bundle_id')
        .eq('product_id', productId)

      if (pbError) throw pbError
      if (!productBundles || productBundles.length === 0) {
        setBundles([])
        setLoading(false)
        return
      }

      const bundleIds = productBundles.map(pb => pb.bundle_id)

      // Fetch full bundle details with items
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_items (
            id,
            quantity,
            products (
              id,
              name,
              price,
              images,
              custom_id,
              stock
            )
          )
        `)
        .in('id', bundleIds)
        .eq('is_active', true)

      if (bundlesError) throw bundlesError
      setBundles(bundlesData || [])
    } catch (error) {
      console.error('Error loading bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBundle = async (bundle) => {
    if (!user) {
      toast.error('Please login to add bundle to cart')
      navigate('/login')
      return
    }

    setAddingBundle(bundle.id)
    try {
      const itemCount = await addBundleToCart(bundle, user.id)
      toast.success(`Bundle added! (${itemCount} items)`)
    } catch (error) {
      toast.error(error.message || 'Failed to add bundle')
    } finally {
      setAddingBundle(null)
    }
  }

  if (loading) {
    return (
      <section className="mt-16 pt-16" style={{ borderTop: '1px solid #E5E5E5' }}>
        <div className="text-center mb-12">
          <p className="text-sm font-bold mb-3 tracking-wider uppercase"
            style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
            COMPLETE YOUR SETUP
          </p>
          <h2 className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Rajdhani', sans-serif", color: '#000000' }}>
            Recommended Bundles
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl overflow-hidden animate-pulse"
              style={{ background: '#F8F8F8', border: '1px solid #E5E5E5' }}>
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (bundles.length === 0) return null

  return (
    <section className="mt-16 pt-16" style={{ borderTop: '1px solid #E5E5E5' }}>
      <div className="text-center mb-12">
        <p className="text-sm font-bold mb-3 tracking-wider uppercase"
          style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
          COMPLETE YOUR SETUP
        </p>
        <h2 className="text-3xl md:text-4xl font-bold"
          style={{ fontFamily: "'Rajdhani', sans-serif", color: '#000000' }}>
          Recommended Bundles & Kits
        </h2>
        <p className="text-gray-600 mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          Get everything you need in one package and save
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map(bundle => {
          const originalPrice = bundle.bundle_items.reduce(
            (sum, item) => sum + (item.products.price * item.quantity),
            0
          )
          const savings = originalPrice - bundle.bundle_price
          const savingsPercent = originalPrice > 0 
            ? ((savings / originalPrice) * 100).toFixed(0) 
            : 0

          return (
            <div key={bundle.id}
              className="rounded-xl overflow-hidden transition-all hover:shadow-xl"
              style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
              {/* Image */}
              {bundle.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={bundle.image_url} 
                    alt={bundle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    Save {savingsPercent}%
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* Title */}
                <div className="flex items-start gap-2 mb-3">
                  <Package size={20} className="text-[#CA2A31] flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg font-bold" 
                    style={{ fontFamily: "'Rajdhani', sans-serif", color: '#000000' }}>
                    {bundle.name}
                  </h3>
                </div>

                {/* Description */}
                {bundle.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    {bundle.description}
                  </p>
                )}

                {/* Products included */}
                <div className="mb-4 p-3 rounded-lg" style={{ background: '#F8F8F8' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: '#666', fontFamily: "'Inter', sans-serif" }}>
                    Includes {bundle.bundle_items.length} Products:
                  </p>
                  <div className="space-y-1">
                    {bundle.bundle_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs"
                        style={{ fontFamily: "'Inter', sans-serif" }}>
                        <span className="text-gray-700">
                          {item.products.name}
                        </span>
                        <span className="text-gray-500">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500 line-through"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded"
                      style={{ background: '#FEF3C7', color: '#92400E', fontFamily: "'Inter', sans-serif" }}>
                      Save ₹{savings.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold"
                    style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
                    ₹{bundle.bundle_price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddBundle(bundle)}
                  disabled={addingBundle === bundle.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ 
                    background: '#CA2A31', 
                    color: '#FFFFFF', 
                    fontFamily: "'Inter', sans-serif" 
                  }}>
                  {addingBundle === bundle.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Add Bundle to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
