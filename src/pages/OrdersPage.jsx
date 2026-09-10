import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Package, ChevronDown, ChevronUp, Search, Truck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { formatINR, formatDate } from '../utils/format'

function getStatusBadge(order) {
  const s = order.order_status
  const p = order.payment_status
  if (p === 'pending_verification') return { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700' }
  if (p === 'failed' || s === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-600' }
  if (s === 'delivered') return { label: 'Delivered', color: 'bg-green-100 text-green-700' }
  if (s === 'shipping') return { label: 'Shipped', color: 'bg-orange-100 text-orange-700' }
  if (p === 'paid') return { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' }
  return { label: 'Processing', color: 'bg-gray-100 text-gray-600' }
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const badge = getStatusBadge(order)
  const addr = (() => { try { return typeof order.address === 'object' ? order.address : JSON.parse(order.address || '{}') } catch { return {} } })()
  const orderId = order.display_order_id || '#' + String(order.id).slice(-6).toUpperCase()

  const steps = ['confirmed', 'shipping', 'delivered']
  const currentStep = steps.indexOf(order.order_status || 'confirmed')
  const isCancelled = order.order_status === 'cancelled' || order.payment_status === 'failed'
  const isPending = order.payment_status === 'pending_verification'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E5D8C8] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5D3A1A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-[#5D3A1A]" />
          </div>
          <div>
            <p className="text-[#1C1006] font-semibold text-sm">{orderId}</p>
            <p className="text-[#8B6A4A] text-xs">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[#5D3A1A] font-bold text-sm">{formatINR(order.total_amount)}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>{badge.label}</span>
          </div>
          {open ? <ChevronUp size={16} className="text-[#8B6A4A]" /> : <ChevronDown size={16} className="text-[#8B6A4A]" />}
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-[#E5D8C8] px-5 py-4 space-y-4">

              {/* Order progress */}
              {!isCancelled && !isPending && (
                <div className="flex items-start">
                  {[
                    { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-500', text: 'text-blue-600' },
                    { key: 'shipping',  label: 'Shipped',   color: 'bg-orange-500', text: 'text-orange-600' },
                    { key: 'delivered', label: 'Delivered', color: 'bg-green-500', text: 'text-green-600' },
                  ].map((step, idx) => {
                    const done = idx <= currentStep
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center w-full">
                          <div className={`w-full h-1 rounded-full ${idx === 0 ? 'opacity-0' : done ? (idx === 1 ? 'bg-blue-300' : 'bg-orange-300') : 'bg-gray-200'}`} />
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${done ? `${step.color} border-transparent` : 'bg-gray-100 border-gray-200'}`}>
                            <span className={`text-xs font-bold ${done ? 'text-white' : 'text-gray-400'}`}>{idx + 1}</span>
                          </div>
                          <div className={`w-full h-1 rounded-full ${idx === 2 ? 'opacity-0' : done && idx < currentStep ? (idx === 0 ? 'bg-blue-300' : 'bg-orange-300') : 'bg-gray-200'}`} />
                        </div>
                        <p className={`text-xs mt-1.5 font-medium ${done ? step.text : 'text-gray-400'}`}>{step.label}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tracking info */}
              {order.tracking_id && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
                  <Truck size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-orange-700 text-xs font-semibold">Tracking ID</p>
                    <p className="text-orange-600 text-sm font-mono">{order.tracking_id}</p>
                    {order.tracking_image_url && (
                      <img src={order.tracking_image_url} alt="Tracking" className="mt-2 h-24 rounded-lg object-cover border border-orange-200" />
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2">
                <p className="text-[#4B3420] text-xs font-semibold uppercase tracking-wider">Items</p>
                {(order.order_items || []).map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl p-2.5">
                    {item.products?.images?.[0] && (
                      <img src={item.products.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => { e.target.style.display = 'none' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1C1006] text-sm font-medium truncate">{item.products?.name || 'Product'}</p>
                      {item.products?.custom_id && <p className="text-[#5D3A1A] text-xs font-mono">{item.products.custom_id}</p>}
                      <p className="text-[#8B6A4A] text-xs">Qty: {item.quantity} &middot; {formatINR(item.price)} each</p>
                    </div>
                    <p className="text-[#5D3A1A] font-semibold text-sm flex-shrink-0">{formatINR(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>

              {/* Address */}
              {addr.full_name && (
                <div className="bg-[#FAFAFA] rounded-xl p-3">
                  <p className="text-[#4B3420] text-xs font-semibold uppercase tracking-wider mb-1.5">Delivery Address</p>
                  <p className="text-[#1C1006] text-sm font-medium">{addr.full_name}</p>
                  <p className="text-[#8B6A4A] text-xs">{addr.phone}</p>
                  <p className="text-[#8B6A4A] text-xs mt-0.5">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
                  <p className="text-[#8B6A4A] text-xs">{addr.city}, {addr.state} &middot; {addr.pincode}</p>
                </div>
              )}

              {/* Total breakdown */}
              <div className="bg-[#FAFAFA] rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between text-[#8B6A4A]">
                  <span>Order Total</span>
                  <span className="text-[#5D3A1A] font-bold text-sm">{formatINR(order.total_amount)}</span>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between text-[#8B6A4A]">
                    <span>Payment</span>
                    <span className="uppercase font-medium">{order.payment_method}</span>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*, order_items(*, products(name, images, custom_id))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [user])

  const filtered = orders.filter(o => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const id = (o.display_order_id || '').toLowerCase()
    return id.includes(q) || String(o.id).toLowerCase().includes(q)
  })

  return (
    <>
      <Helmet>
        <title>My Orders - Royal Hoof</title>
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1C1006] mb-6" style={{ fontFamily: 'Georgia, serif' }}>My Orders</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6A4A]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID..."
            className="w-full bg-white border border-[#E5D8C8] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#1C1006] placeholder-[#8B6A4A] focus:outline-none focus:border-[#5D3A1A]" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6A4A] hover:text-[#1C1006] text-xs">Clear</button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={56} className="text-[#E5D8C8] mx-auto mb-4" />
            {search ? (
              <>
                <p className="text-[#4B3420] text-lg">No orders found for &ldquo;{search}&rdquo;</p>
                <button onClick={() => setSearch('')} className="mt-3 text-[#D97706] text-xs hover:underline">Clear search</button>
              </>
            ) : (
              <>
                <p className="text-[#4B3420] text-lg font-semibold mb-2">No orders yet</p>
                <p className="text-[#8B6A4A] text-sm mb-6">Your sacred bead orders will appear here</p>
                <Link to="/products" className="px-6 py-2.5 bg-[#5D3A1A] text-white rounded-lg text-sm font-semibold hover:bg-[#7A4E28] transition-all">
                  Shop Horse Riding
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </>
  )
}
