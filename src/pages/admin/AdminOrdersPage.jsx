import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Edit, Package, CheckCircle, XCircle, Clock, Truck, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { formatINR } from '../../utils/format'
import toast from 'react-hot-toast'

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Load orders
  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (id, name, images, price)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
      setFilteredOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()

    // Subscribe to new orders
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => [payload.new, ...prev])
        toast.success('New order received!')
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter orders
  useEffect(() => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.guest_name?.toLowerCase().includes(query) ||
        order.guest_email?.toLowerCase().includes(query) ||
        order.razorpay_order_id?.toLowerCase().includes(query)
      )
    }

    // Order status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.order_status === filterStatus)
    }

    // Payment status filter
    if (filterPayment !== 'all') {
      filtered = filtered.filter(order => order.payment_status === filterPayment)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, filterStatus, filterPayment, orders])

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }))
      }
      toast.success('Order status updated')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status, type = 'order') => {
    const statuses = type === 'order' ? ORDER_STATUSES : PAYMENT_STATUSES
    const statusObj = statuses.find(s => s.value === status)
    if (!statusObj) return null

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusObj.color}`}>
        {statusObj.label}
      </span>
    )
  }

  const parseAddress = (addressStr) => {
    try {
      return typeof addressStr === 'string' ? JSON.parse(addressStr) : addressStr
    } catch {
      return {}
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Order Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Order Status</option>
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payment Status</option>
                {PAYMENT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.order_status === 'pending').length}
                </p>
              </div>
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.payment_status === 'paid').length}
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatINR(orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0))}
                </p>
              </div>
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.guest_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.guest_email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatINR(order.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.payment_status, 'payment')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.order_status, 'order')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-500">ID: {selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedOrder.guest_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedOrder.guest_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedOrder.guest_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedOrder.address && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(() => {
                        const addr = parseAddress(selectedOrder.address)
                        return (
                          <p className="text-gray-700">
                            {addr.full_name && <span className="font-medium">{addr.full_name}<br /></span>}
                            {addr.address1}<br />
                            {addr.address2 && <>{addr.address2}<br /></>}
                            {addr.city}, {addr.state} - {addr.pincode}<br />
                            {addr.phone && <>Phone: {addr.phone}</>}
                          </p>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                        {item.products?.images?.[0] && (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products?.name || 'Product'}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatINR(item.price * item.quantity)}</p>
                          <p className="text-xs text-gray-500">{formatINR(item.price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg">{formatINR(selectedOrder.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      {getStatusBadge(selectedOrder.payment_status, 'payment')}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{selectedOrder.payment_method || 'Razorpay'}</span>
                    </div>
                    {selectedOrder.razorpay_order_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Razorpay Order ID:</span>
                        <span className="font-mono text-sm">{selectedOrder.razorpay_order_id}</span>
                      </div>
                    )}
                    {selectedOrder.razorpay_payment_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="font-mono text-sm">{selectedOrder.razorpay_payment_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Status Update */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
                  <div className="flex gap-2">
                    {ORDER_STATUSES.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status.value)}
                        disabled={updatingStatus || selectedOrder.order_status === status.value}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedOrder.order_status === status.value
                            ? `${status.color} opacity-100`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
