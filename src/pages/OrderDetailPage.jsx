import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

  const generateInvoice = () => {
    try {
      const doc = new jsPDF()
      const orderId = order.display_order_id || '#' + String(order.id).slice(-6).toUpperCase()
      const addr = order.parsedAddress || {}
      
      // Company Header
      doc.setFillColor(202, 42, 49)
      doc.rect(0, 0, 210, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont(undefined, 'bold')
      doc.text('KUSTOM KOATS', 105, 15, { align: 'center' })
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.text('Premium Automotive Coatings', 105, 22, { align: 'center' })
      doc.text('https://kustomkoats.in', 105, 28, { align: 'center' })

      // Invoice Title
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(18)
      doc.setFont(undefined, 'bold')
      doc.text('TAX INVOICE', 105, 48, { align: 'center' })

      // Invoice Details
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.text(`Invoice No: ${orderId}`, 14, 60)
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 14, 66)
      doc.text(`Order Type: ${order.order_type === 'pos_sale' ? 'POS SALE' : 'ONLINE ORDER'}`, 14, 72)
      doc.text(`Payment Method: ${(order.payment_method || 'N/A').toUpperCase()}`, 14, 78)
      doc.text(`Payment Status: ${(order.payment_status || 'pending').toUpperCase()}`, 14, 84)

      // Bill To
      doc.setFont(undefined, 'bold')
      doc.text('BILL TO:', 14, 98)
      doc.setFont(undefined, 'normal')
      const billToY = 104
      doc.text(addr.full_name || addr.fullName || order.guest_name || 'Customer', 14, billToY)
      if (addr.phone || order.guest_phone) doc.text(`Phone: ${addr.phone || order.guest_phone}`, 14, billToY + 6)
      if (addr.address1 || addr.addressLine1) {
        doc.text(addr.address1 || addr.addressLine1, 14, billToY + 12)
        if (addr.address2 || addr.addressLine2) doc.text(addr.address2 || addr.addressLine2, 14, billToY + 18)
        doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || addr.zipCode || ''}`, 14, billToY + (addr.address2 || addr.addressLine2 ? 24 : 18))
      }

      // Items Table
      const tableStartY = (addr.address1 || addr.addressLine1) ? ((addr.address2 || addr.addressLine2) ? 136 : 130) : 116
      const items = (order.order_items || []).map(item => [
        item.products?.custom_id || item.products?.name || 'Product',
        item.products?.name || 'N/A',
        item.quantity.toString(),
        `₹${item.price?.toLocaleString('en-IN')}`,
        `₹${(item.quantity * item.price)?.toLocaleString('en-IN')}`
      ])

      doc.autoTable({
        startY: tableStartY,
        head: [['Product ID', 'Description', 'Qty', 'Price', 'Amount']],
        body: items,
        theme: 'striped',
        headStyles: { fillColor: [202, 42, 49], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 70 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        }
      })

      // Totals
      const finalY = doc.lastAutoTable.finalY + 10
      doc.setFont(undefined, 'bold')
      doc.setFontSize(12)
      doc.text('Total Amount:', 130, finalY)
      doc.text(`₹${order.total_amount?.toLocaleString('en-IN')}`, 185, finalY, { align: 'right' })

      // Footer
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Thank you for your business!', 105, 280, { align: 'center' })
      doc.text('For any queries, contact us at support@kustomkoats.in', 105, 285, { align: 'center' })

      // Save
      doc.save(`Invoice-${orderId}.pdf`)
      toast.success('Invoice downloaded!')
    } catch (error) {
      console.error('Invoice generation error:', error)
      toast.error('Failed to generate invoice')
    }
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
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 shadow-sm mb-6">
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

        {/* Download Invoice Button */}
        <button
          onClick={generateInvoice}
          className="w-full flex items-center justify-center gap-2 bg-[#5D3A1A] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#7A4E28] transition-all shadow-sm"
        >
          <Download size={18} />
          Download Invoice
        </button>
      </div>
    </>
  )
}
