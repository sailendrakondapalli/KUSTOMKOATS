import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertCircle, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  Phone,
  Package
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatINR } from '../../utils/format'
import toast from 'react-hot-toast'

export default function AdminPaymentFailuresPage() {
  const [failures, setFailures] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFailure, setSelectedFailure] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [reviewedFilter, setReviewedFilter] = useState('all') // all | reviewed | unreviewed
  const [errorCodeFilter, setErrorCodeFilter] = useState('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  
  // Pagination
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchFailures()
    fetchStats()
  }, [page, reviewedFilter, errorCodeFilter, paymentMethodFilter, dateRange])

  const fetchFailures = async () => {
    setLoading(true)
    try {
      const offset = (page - 1) * limit
      
      let url = `${import.meta.env.VITE_API_URL}/api/payment-failures?limit=${limit}&offset=${offset}`
      
      if (reviewedFilter !== 'all') {
        url += `&reviewed=${reviewedFilter === 'reviewed'}`
      }
      
      if (errorCodeFilter !== 'all') {
        url += `&error_code=${errorCodeFilter}`
      }
      
      if (paymentMethodFilter !== 'all') {
        url += `&payment_method=${paymentMethodFilter}`
      }
      
      if (dateRange.start) {
        url += `&start_date=${dateRange.start}`
      }
      
      if (dateRange.end) {
        url += `&end_date=${dateRange.end}`
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setFailures(result.data)
        setTotal(result.count)
      }
    } catch (error) {
      console.error('Error fetching payment failures:', error)
      toast.error('Failed to load payment failures')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/payment-failures/stats`
      
      if (dateRange.start) {
        url += `?start_date=${dateRange.start}`
      }
      
      if (dateRange.end) {
        url += `${dateRange.start ? '&' : '?'}end_date=${dateRange.end}`
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const markAsReviewed = async (id, notes = '') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment-failures/${id}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ admin_notes: notes })
        }
      )

      const result = await response.json()
      
      if (result.success) {
        toast.success('Marked as reviewed')
        fetchFailures()
        setShowDetails(false)
      } else {
        toast.error(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error marking as reviewed:', error)
      toast.error('Failed to update')
    }
  }

  const viewDetails = async (failureId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment-failures/${failureId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      const result = await response.json()
      
      if (result.success) {
        setSelectedFailure(result.data)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('Error fetching failure details:', error)
      toast.error('Failed to load details')
    }
  }

  const filteredFailures = failures.filter(f => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      f.customer_email?.toLowerCase().includes(query) ||
      f.customer_phone?.includes(query) ||
      f.customer_name?.toLowerCase().includes(query) ||
      f.error_description?.toLowerCase().includes(query) ||
      f.razorpay_order_id?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Payment Failures</h1>
        <p className="text-gray-600">Monitor and analyze failed payment transactions</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <span className="text-red-600 text-sm font-semibold">Total Failures</span>
            </div>
            <p className="text-3xl font-bold text-black">{stats.total_failures}</p>
            <p className="text-xs text-gray-500 mt-1">Failed transactions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <DollarSign className="text-orange-600" size={24} />
              </div>
              <span className="text-orange-600 text-sm font-semibold">Failed Amount</span>
            </div>
            <p className="text-3xl font-bold text-black">
              {formatINR(stats.total_failed_amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total revenue lost</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CreditCard className="text-purple-600" size={24} />
              </div>
              <span className="text-purple-600 text-sm font-semibold">Avg. Amount</span>
            </div>
            <p className="text-3xl font-bold text-black">
              {formatINR(stats.average_failure_amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per failed transaction</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <AlertCircle className="text-blue-600" size={24} />
              </div>
              <span className="text-blue-600 text-sm font-semibold">Top Error</span>
            </div>
            <p className="text-xl font-bold text-black truncate">
              {Object.entries(stats.by_error_code)[0]?.[0] || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {Object.entries(stats.by_error_code)[0]?.[1]?.count || 0} occurrences
            </p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-black">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, email..."
              className="w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            />
          </div>

          {/* Review Status */}
          <select
            value={reviewedFilter}
            onChange={(e) => { setReviewedFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
          >
            <option value="all">All Status</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="reviewed">Reviewed</option>
          </select>

          {/* Error Code */}
          <select
            value={errorCodeFilter}
            onChange={(e) => { setErrorCodeFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
          >
            <option value="all">All Errors</option>
            {stats && Object.keys(stats.by_error_code).map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
          >
            <option value="all">All Methods</option>
            {stats && Object.keys(stats.by_payment_method).map(method => (
              <option key={method} value={method}>
                {method.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 px-2 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 px-2 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            />
          </div>
        </div>
      </div>

      {/* Failures Table */}
      <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Error</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredFailures.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No payment failures found
                  </td>
                </tr>
              ) : (
                filteredFailures.map((failure) => (
                  <tr key={failure.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(failure.failed_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black">
                          {failure.customer_name || 'Guest'}
                        </span>
                        <span className="text-xs text-gray-500">{failure.customer_email}</span>
                        <span className="text-xs text-gray-500">{failure.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-red-600">
                          {failure.error_code}
                        </span>
                        <span className="text-xs text-gray-600 truncate max-w-xs">
                          {failure.error_description}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 uppercase">
                      {failure.payment_method}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-black">
                      {formatINR(failure.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {failure.reviewed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <CheckCircle size={12} />
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          <XCircle size={12} />
                          Unreviewed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => viewDetails(failure.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t-2 border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Failure Details Modal */}
      {showDetails && selectedFailure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Payment Failure Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium text-black">{selectedFailure.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-black">{selectedFailure.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium text-black">{selectedFailure.customer_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed At:</span>
                      <p className="font-medium text-black">
                        {new Date(selectedFailure.failed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={20} />
                    Error Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-red-700 font-medium">Error Code:</span>
                      <p className="font-bold text-red-900">{selectedFailure.error_code}</p>
                    </div>
                    <div>
                      <span className="text-red-700 font-medium">Description:</span>
                      <p className="text-red-900">{selectedFailure.error_description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-red-700 font-medium">Source:</span>
                        <p className="text-red-900">{selectedFailure.error_source}</p>
                      </div>
                      <div>
                        <span className="text-red-700 font-medium">Step:</span>
                        <p className="text-red-900">{selectedFailure.error_step}</p>
                      </div>
                      <div>
                        <span className="text-red-700 font-medium">Reason:</span>
                        <p className="text-red-900">{selectedFailure.error_reason}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-bold text-black text-xl">{formatINR(selectedFailure.amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <p className="font-medium text-black uppercase">{selectedFailure.payment_method}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Razorpay Order ID:</span>
                      <p className="font-mono text-xs text-black">{selectedFailure.razorpay_order_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Razorpay Payment ID:</span>
                      <p className="font-mono text-xs text-black">{selectedFailure.razorpay_payment_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                {selectedFailure.orders && (
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                      <Package size={20} />
                      Order Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Order ID:</span>
                        <p className="font-medium text-black">{selectedFailure.orders.display_order_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Order Status:</span>
                        <p className="font-medium text-black uppercase">{selectedFailure.orders.order_status}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedFailure.reviewed && (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Admin Notes</h3>
                    <p className="text-sm text-green-900">
                      {selectedFailure.admin_notes || 'No notes added'}
                    </p>
                    <p className="text-xs text-green-700 mt-2">
                      Reviewed at: {new Date(selectedFailure.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {!selectedFailure.reviewed && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => markAsReviewed(selectedFailure.id)}
                      className="flex-1 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="flex-1 py-2 border-2 border-gray-300 text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
