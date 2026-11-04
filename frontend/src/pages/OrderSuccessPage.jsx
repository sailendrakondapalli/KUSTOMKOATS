import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Package, Home, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { formatINR } from '../utils/format'

export default function OrderSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const orderId = location.state?.orderId
  
  useEffect(() => {
    if (!orderId) {
      navigate('/')
      return
    }
    
    loadOrder()
  }, [orderId])
  
  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, images))')
        .eq('id', orderId)
        .single()
        
      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#5D3A1A] rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#1C1006] mb-2">Order Confirmed!</h1>
        <p className="text-[#4B3420]">Thank you for your purchase</p>
        {order && (
          <p className="text-sm text-[#8B6A4A] mt-2">
            Order ID: <span className="font-mono">{order.id.slice(0, 8)}...</span>
          </p>
        )}
      </motion.div>
      
      {order && (
        <div className="bg-white rounded-xl border border-[#E5D8C8] p-6 mb-6">
          <h2 className="font-semibold text-[#1C1006] mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {item.products?.images?.[0] && (
                  <img
                    src={item.products.images[0]}
                    alt={item.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1C1006]">{item.products?.name}</p>
                  <p className="text-xs text-[#8B6A4A]">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[#5D3A1A]">
                  {formatINR(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#E5D8C8] pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid</span>
              <span className="text-[#5D3A1A]">{formatINR(order.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          📧 Order confirmation has been sent to your email address.
          You can track your order status anytime.
        </p>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 border border-[#5D3A1A] text-[#5D3A1A] rounded-lg hover:bg-[#5D3A1A]/5 transition-all flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Continue Shopping
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 py-3 bg-[#5D3A1A] text-white rounded-lg hover:bg-[#7A4E28] transition-all flex items-center justify-center gap-2"
        >
          <List size={18} />
          View Orders
        </button>
      </div>
    </div>
  )
}
