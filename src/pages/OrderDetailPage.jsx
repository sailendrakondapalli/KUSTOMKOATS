import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrderDetails()
  }, [id, user])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              images,
              custom_id
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      // Parse address from JSON string
      if (data && data.address) {
        try {
          data.parsedAddress = typeof data.address === 'string' ? JSON.parse(data.address) : data.address
        } catch (e) {
          console.error('Error parsing address:', e)
          data.parsedAddress = null
        }
      }
      
      setOrder(data)
    } catch (err) {
      console.error('Error fetching order:', err)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        icon: Clock,
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        description: 'Your order is being processed'
      },
      confirmed: {
        label: 'Confirmed',
        icon: CheckCircle,
        bgColor: '#DBEAFE',
        textColor: '#1E40AF',
        description: 'Your order has been confirmed'
      },
      processing: {
        label: 'Processing',
        icon: Package,
        bgColor: '#E0E7FF',
        textColor: '#3730A3',
        description: 'Your order is being prepared'
      },
      shipped: {
        label: 'Shipped',
        icon: Truck,
        bgColor: '#DDD6FE',
        textColor: '#5B21B6',
        description: 'Your order is on the way'
      },
      delivered: {
        label: 'Delivered',
        icon: CheckCircle,
        bgColor: '#D1FAE5',
        textColor: '#065F46',
        description: 'Your order has been delivered'
      },
      cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        bgColor: '#FEE2E2',
        textColor: '#991B1B',
        description: 'This order has been cancelled'
      }
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-12">
        <div className="w-8 h-8 border-2 border-[#CA2A31] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4">
        <Package size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-600 text-sm mb-6">We couldn't find this order</p>
        <button
          onClick={() => navigate('/profile')}
          className="px-6 py-2 bg-[#5D3A1A] text-white rounded-lg font-semibold hover:bg-[#7A4E28] transition-all"
        >
          Back to Profile
        </button>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.order_status)
  const StatusIcon = statusInfo.icon

  return (
    <>
      <Helmet>
        <title>Order #{order.razorpay_order_id || order.id.slice(0, 8)} - Kustom Koats</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-[#5D3A1A] hover:text-[#7A4E28] mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Profile</span>
        </button>

        {/* Order Header */}
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1C1006]" style={{ fontFamily: 'Georgia, serif' }}>
                Order #{order.razorpay_order_id || order.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-[#8B6A4A] mt-1 flex items-center gap-2">
                <Calendar size={14} />
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-lg flex items-center gap-2 self-start sm:self-center"
              style={{ background: statusInfo.bgColor, color: statusInfo.textColor }}
            >
              <StatusIcon size={18} />
              <span className="font-semibold text-sm">{statusInfo.label}</span>
            </div>
          </div>
          <p className="text-sm text-[#4B3420]">{statusInfo.description}</p>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-[#5D3A1A] font-semibold flex items-center gap-2 mb-4">
            <Package size={16} /> Order Items ({order.order_items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-[#E5D8C8] last:border-0 last:pb-0">
                {item.products?.images?.[0] ? (
                  <img
                    src={item.products.images[0]}
                    alt={item.products.name}
                    className="w-20 h-20 object-cover rounded-lg border border-[#E5D8C8] flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-[#F5F0EB] rounded-lg border border-[#E5D8C8] flex items-center justify-center flex-shrink-0">
                    <Package size={24} className="text-[#8B6A4A]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#1C1006] font-semibold text-sm">
                    {item.products?.name || 'Product'}
                  </h3>
                  {item.products?.custom_id && (
                    <p className="text-xs text-[#8B6A4A] mt-0.5">SKU: {item.products.custom_id}</p>
                  )}
                  <p className="text-xs text-[#4B3420] mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-[#1C1006]">
                    ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-[#8B6A4A] mt-1">
                    ₹{(item.price / item.quantity).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t border-[#E5D8C8] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#4B3420]">Subtotal</span>
              <span className="text-[#1C1006] font-medium">
                ₹{order.total_amount?.toLocaleString('en-IN')}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4B3420]">Discount</span>
                <span className="text-green-600 font-medium">
                  -₹{order.discount_amount?.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#4B3420]">Shipping</span>
              <span className="text-[#1C1006] font-medium">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-[#E5D8C8]">
              <span className="text-[#1C1006]">Total</span>
              <span className="text-[#5D3A1A]">
                ₹{order.total_amount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.parsedAddress && (
          <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-[#5D3A1A] font-semibold flex items-center gap-2 mb-4">
              <MapPin size={16} /> Shipping Address
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-[#1C1006]">{order.parsedAddress.full_name || order.parsedAddress.fullName}</p>
              <p className="text-[#4B3420]">{order.parsedAddress.phone}</p>
              <p className="text-[#4B3420]">{order.parsedAddress.address1 || order.parsedAddress.addressLine1}</p>
              {(order.parsedAddress.address2 || order.parsedAddress.addressLine2) && (
                <p className="text-[#4B3420]">{order.parsedAddress.address2 || order.parsedAddress.addressLine2}</p>
              )}
              <p className="text-[#4B3420]">
                {order.parsedAddress.city}, {order.parsedAddress.state} {order.parsedAddress.pincode || order.parsedAddress.zipCode}
              </p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#5D3A1A] font-semibold flex items-center gap-2 mb-4">
            <CreditCard size={16} /> Payment Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#4B3420]">Payment Method</span>
              <span className="text-[#1C1006] font-medium">
                {order.payment_method === 'razorpay' ? 'Online Payment' : order.payment_method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4B3420]">Payment Status</span>
              <span
                className={`font-medium ${
                  order.payment_status === 'completed'
                    ? 'text-green-600'
                    : order.payment_status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {order.payment_status === 'completed' ? '✓ Paid' : 
                 order.payment_status === 'pending' ? 'Pending' : 'Failed'}
              </span>
            </div>
            {order.razorpay_payment_id && (
              <div className="flex justify-between">
                <span className="text-[#4B3420]">Transaction ID</span>
                <span className="text-[#1C1006] font-mono text-xs">
                  {order.razorpay_payment_id}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
