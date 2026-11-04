import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, ShoppingCart, Store, Globe, RefreshCw, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'
import { formatINR } from '../../utils/format'

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, online, pos
  const [filterPayment, setFilterPayment] = useState('all') // all, cash, card, upi, razorpay
  const [filterStatus, setFilterStatus] = useState('all') // all, pending, confirmed, shipped, delivered, cancelled
  const [dateRange, setDateRange] = useState('all') // all, today, week, month
  const [stats, setStats] = useState({
    totalRevenue: 0,
    onlineRevenue: 0,
    posRevenue: 0,
    totalTransactions: 0,
    onlineCount: 0,
    posCount: 0
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, filterType, filterPayment, filterStatus, dateRange])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      // Fetch all orders (both online and POS)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          display_order_id,
          user_id,
          guest_name,
          guest_phone,
          total_amount,
          payment_method,
          payment_status,
          order_status,
          order_type,
          razorpay_payment_id,
          razorpay_order_id,
          created_at,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              custom_id
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Supabase error:', ordersError)
        throw ordersError
      }

      if (!ordersData) {
        setTransactions([])
        calculateStats([])
        return
      }

      // Fetch user profiles separately for orders with user_id
      const userIds = ordersData
        .filter(order => order.user_id)
        .map(order => order.user_id)
      
      let profilesMap = {}
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds)
        
        if (profilesData) {
          profilesMap = Object.fromEntries(
            profilesData.map(profile => [profile.id, profile])
          )
        }
      }

      // Transform data for display
      const transformed = ordersData.map(order => {
        const profile = order.user_id ? profilesMap[order.user_id] : null
        return {
          id: order.id,
          orderId: order.display_order_id || order.id,
          type: order.order_type === 'pos_sale' ? 'POS' : 'Online',
          customerName: order.guest_name || profile?.full_name || 'Anonymous',
          customerPhone: order.guest_phone || '-',
          customerEmail: profile?.email || '-',
          items: order.order_items?.length || 0,
          itemDetails: order.order_items || [],
          amount: order.total_amount || 0,
          paymentMethod: order.payment_method || 'N/A',
          paymentStatus: order.payment_status || 'pending',
          orderStatus: order.order_status || 'pending',
          razorpayId: order.razorpay_payment_id,
          date: new Date(order.created_at),
          rawData: order
        }
      })

      setTransactions(transformed)
      calculateStats(transformed)
    } catch (error) {
      console.error('Error loading transactions:', error)
      // Show more specific error message
      if (error.message) {
        toast.error(`Failed to load transactions: ${error.message}`)
      } else {
        toast.error('Failed to load transactions')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const stats = {
      totalRevenue: 0,
      onlineRevenue: 0,
      posRevenue: 0,
      totalTransactions: data.length,
      onlineCount: 0,
      posCount: 0
    }

    data.forEach(t => {
      if (t.paymentStatus === 'paid' || t.paymentStatus === 'confirmed') {
        stats.totalRevenue += t.amount
        if (t.type === 'POS') {
          stats.posRevenue += t.amount
          stats.posCount++
        } else {
          stats.onlineRevenue += t.amount
          stats.onlineCount++
        }
      }
    })

    setStats(stats)
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.orderId.toLowerCase().includes(query) ||
        t.customerName.toLowerCase().includes(query) ||
        t.customerPhone.includes(query) ||
        t.customerEmail.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => 
        filterType === 'online' ? t.type === 'Online' : t.type === 'POS'
      )
    }

    // Payment method filter
    if (filterPayment !== 'all') {
      filtered = filtered.filter(t => 
        t.paymentMethod.toLowerCase() === filterPayment.toLowerCase()
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => 
        t.orderStatus.toLowerCase() === filterStatus.toLowerCase()
      )
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(t => {
        if (dateRange === 'today') return t.date >= today
        if (dateRange === 'week') return t.date >= weekAgo
        if (dateRange === 'month') return t.date >= monthAgo
        return true
      })
    }

    setFilteredTransactions(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Order ID', 'Type', 'Date', 'Customer', 'Phone', 'Items', 'Amount', 'Payment Method', 'Status']
    const rows = filteredTransactions.map(t => [
      t.orderId,
      t.type,
      t.date.toLocaleString('en-IN'),
      t.customerName,
      t.customerPhone,
      t.items,
      t.amount,
      t.paymentMethod,
      t.orderStatus
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Exported to CSV')
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPaymentBadge = (method) => {
    const styles = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      razorpay: 'bg-indigo-100 text-indigo-800',
      cod: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[method?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {method || 'N/A'}
      </span>
    )
  }

  return (
    <KKAdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Transactions</h1>
          <p className="text-gray-600">Unified view of online orders and POS sales</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <ShoppingCart size={16} />
              <span>Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatINR(stats.totalRevenue)}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
              <Globe size={16} />
              <span>Online</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{formatINR(stats.onlineRevenue)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.onlineCount} orders</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <Store size={16} />
              <span>POS</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{formatINR(stats.posRevenue)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.posCount} sales</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Avg Order Value</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatINR(stats.totalTransactions > 0 ? stats.totalRevenue / stats.totalTransactions : 0)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">POS Share</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalRevenue > 0 ? ((stats.posRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order ID, customer..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CA2A31]"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CA2A31]"
              >
                <option value="all">All Types</option>
                <option value="online">Online Only</option>
                <option value="pos">POS Only</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CA2A31]"
              >
                <option value="all">All Payments</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="razorpay">Razorpay</option>
                <option value="cod">COD</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CA2A31]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CA2A31]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={loadTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#CA2A31] text-white rounded-lg hover:bg-[#a82228]"
            >
              <Download size={16} />
              Export CSV
            </button>
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-[#CA2A31] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'POS' ? (
                            <Store size={16} className="text-green-600" />
                          ) : (
                            <Globe size={16} className="text-blue-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            transaction.type === 'POS' ? 'text-green-700' : 'text-blue-700'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-900">{transaction.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {transaction.date.toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{transaction.customerName}</div>
                        {transaction.customerEmail !== '-' && (
                          <div className="text-xs text-gray-500">{transaction.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{transaction.customerPhone}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-900">{transaction.items}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">{formatINR(transaction.amount)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getPaymentBadge(transaction.paymentMethod)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(transaction.orderStatus)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => window.location.href = `/admin/orders/${transaction.id}`}
                          className="text-[#CA2A31] hover:text-[#a82228]"
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
    </KKAdminLayout>
  )
}
