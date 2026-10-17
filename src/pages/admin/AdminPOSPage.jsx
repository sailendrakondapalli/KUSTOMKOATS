import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingCart, Trash2, Plus, Minus, DollarSign, CreditCard, Smartphone, Wifi, WifiOff, RefreshCw, Printer } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'
import { formatINR } from '../../utils/format'
import { 
  syncProductsToLocal, 
  getLocalProducts, 
  searchLocalProducts 
} from '../../services/offlineDB'
import { 
  createPOSSale, 
  syncPendingSales, 
  checkOnlineStatus 
} from '../../services/posService'
import { getPendingSales } from '../../services/offlineDB'
import { printBrandedInvoice } from '../../utils/brandedInvoiceGenerator'

// Helper function to convert POS cart to order format for branded invoice
const convertPOSCartToOrder = (cart, customerName, customerPhone, orderId) => {
  // Convert cart items to order_items format
  const order_items = cart.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    products: {
      id: item.product_id,
      name: item.name,
      hsn_code: '32089090' // Default HSN code for paints
    }
  }))

  // Create parsedAddress from customer info
  const parsedAddress = {
    address1: 'Walk-in Customer Address',
    addressLine1: 'Walk-in Customer Address',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411048',
    zipCode: '411048',
    phone: customerPhone || 'N/A',
    email: null,
    gst: null
  }

  return {
    id: orderId || Date.now(),
    display_order_id: orderId ? `#POS-${orderId}` : `#POS-${Date.now().toString().slice(-6)}`,
    created_at: new Date().toISOString(),
    order_items,
    parsedAddress,
    guest_phone: customerPhone || 'N/A',
    guest_name: customerName || 'Walk-in Customer'
  }
}

export default function AdminPOSPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const searchInputRef = useRef(null)
  const receiptRef = useRef(null)
  const [lastSaleId, setLastSaleId] = useState(null)

  // Load products on mount
  useEffect(() => {
    loadProducts()
    checkConnection()
    loadPendingCount()
    
    // Auto-sync every 30 seconds
    const syncInterval = setInterval(autoSync, 30000)
    
    // Check connection every 10 seconds
    const connInterval = setInterval(checkConnection, 10000)
    
    return () => {
      clearInterval(syncInterval)
      clearInterval(connInterval)
    }
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Try to load from server
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name')

      if (!error && data) {
        setProducts(data)
        setFilteredProducts(data)
        // Sync to local DB
        await syncProductsToLocal(data)
      } else {
        // Load from local DB
        const localData = await getLocalProducts()
        setProducts(localData)
        setFilteredProducts(localData)
      }
    } catch (error) {
      // Fallback to local DB
      const localData = await getLocalProducts()
      setProducts(localData)
      setFilteredProducts(localData)
    } finally {
      setLoading(false)
    }
  }

  const checkConnection = async () => {
    const online = await checkOnlineStatus()
    setIsOnline(online)
  }

  const loadPendingCount = async () => {
    try {
      const pending = await getPendingSales()
      setPendingCount(pending.length)
    } catch (error) {
      console.error('Error loading pending count:', error)
      setPendingCount(0)
    }
  }

  const autoSync = async () => {
    try {
      const online = await checkOnlineStatus()
      if (online) {
        const pending = await getPendingSales()
        if (pending.length > 0) {
          await handleSync()
        }
      }
    } catch (error) {
      console.error('Auto-sync error:', error)
    }
  }

  const handleSync = async () => {
    if (syncing) return // Prevent concurrent syncs
    
    setSyncing(true)
    try {
      const result = await syncPendingSales()
      if (result.skipped) {
        // Sync already in progress, silently skip
        return
      }
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} offline sales`)
        await loadPendingCount()
        await loadProducts() // Refresh stock
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} sales`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredProducts(products)
      return
    }

    try {
      const results = await searchLocalProducts(query)
      setFilteredProducts(results)
    } catch (error) {
      console.error('Search error:', error)
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.custom_id && p.custom_id.toLowerCase().includes(query.toLowerCase()))
      )
      setFilteredProducts(results)
    }
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id)
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Not enough stock')
        return
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }])
    }
    toast.success('Added to cart')
    searchInputRef.current?.focus()
  }

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta
        if (newQty <= 0) return null
        if (newQty > item.stock) {
          toast.error('Not enough stock')
          return item
        }
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setShowPayment(false)
    setCashReceived('')
    setSearchQuery('')
    searchInputRef.current?.focus()
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateChange = () => {
    const total = calculateTotal()
    const received = parseFloat(cashReceived) || 0
    return Math.max(0, received - total)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPayment(true)
  }

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < calculateTotal())) {
      toast.error('Insufficient cash received')
      return
    }

    // For UPI and Card payments
    if (paymentMethod === 'upi' || paymentMethod === 'card') {
      // Check if online
      const online = await checkOnlineStatus()
      
      if (online) {
        // Use Razorpay when online
        handleRazorpayPayment()
      } else {
        // Offline mode - record as pending verification
        handleOfflineDigitalPayment()
      }
      return
    }

    // Cash payment - process directly
    setLoading(true)
    try {
      const result = await createPOSSale({
        items: cart,
        total: calculateTotal(),
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        changeGiven: paymentMethod === 'cash' ? calculateChange() : 0,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || null
      })

      if (result.success) {
        if (result.online) {
          toast.success('Sale completed!')
        } else {
          toast.success('Sale saved offline - Will sync later')
          await loadPendingCount()
        }
        
        // Store sale ID for invoice generation
        setLastSaleId(result.saleId)
        
        // Generate and print branded invoice
        const orderData = convertPOSCartToOrder(cart, customerName, customerPhone, result.saleId)
        await printBrandedInvoice(orderData, window.location.origin)
        
        // Clear cart after invoice generation
        setTimeout(() => {
          clearCart()
        }, 500)
        
        await loadProducts() // Refresh stock
      }
    } catch (error) {
      toast.error('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOfflineDigitalPayment = async () => {
    setLoading(true)
    try {
      const result = await createPOSSale({
        items: cart,
        total: calculateTotal(),
        paymentMethod,
        cashReceived: null,
        changeGiven: 0,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || null,
        offlinePayment: true // Flag for offline digital payment
      })

      if (result.success) {
        toast.success(`${paymentMethod.toUpperCase()} payment recorded offline - Pending verification`)
        await loadPendingCount()
        
        // Store sale ID for invoice generation
        setLastSaleId(result.saleId)
        
        // Generate and print branded invoice
        const orderData = convertPOSCartToOrder(cart, customerName, customerPhone, result.saleId)
        await printBrandedInvoice(orderData, window.location.origin)
        
        // Clear cart after invoice generation
        setTimeout(() => {
          clearCart()
        }, 500)
        
        await loadProducts()
      }
    } catch (error) {
      toast.error('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpayPayment = async () => {
    setLoading(true)
    try {
      // Create order in Razorpay
      const { data: orderData, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: calculateTotal(),
          currency: 'INR',
          notes: {
            customer_name: customerName || 'Walk-in Customer',
            customer_phone: customerPhone || '',
            order_type: 'pos_sale'
          }
        }
      })

      if (error) throw error

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: calculateTotal() * 100,
          currency: 'INR',
          name: 'KUSTOM KOATS',
          description: 'POS Sale Payment',
          order_id: orderData.order_id,
          method: {
            upi: paymentMethod === 'upi',
            card: paymentMethod === 'card',
            wallet: false,
            netbanking: false
          },
          prefill: {
            name: customerName || 'Walk-in Customer',
            contact: customerPhone || ''
          },
          theme: {
            color: '#CA2A31'
          },
          handler: async function (response) {
            // Payment successful
            try {
              const result = await createPOSSale({
                items: cart,
                total: calculateTotal(),
                paymentMethod,
                cashReceived: null,
                changeGiven: 0,
                customerName: customerName || 'Walk-in Customer',
                customerPhone: customerPhone || null,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              })

              if (result.success) {
                toast.success('Payment successful!')
                
                // Store sale ID for invoice generation
                setLastSaleId(result.saleId)
                
                // Generate and print branded invoice
                const orderData = convertPOSCartToOrder(cart, customerName, customerPhone, result.saleId)
                await printBrandedInvoice(orderData, window.location.origin)
                
                // Clear cart after invoice generation
                setTimeout(() => {
                  clearCart()
                }, 500)
                
                await loadProducts()
              }
            } catch (error) {
              toast.error('Failed to record sale')
            } finally {
              setLoading(false)
            }
          },
          modal: {
            ondismiss: function() {
              setLoading(false)
              toast.error('Payment cancelled')
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }

      script.onerror = () => {
        setLoading(false)
        toast.error('Failed to load payment gateway')
      }
    } catch (error) {
      console.error('Razorpay error:', error)
      toast.error('Failed to initialize payment')
      setLoading(false)
    }
  }

  return (
    <KKAdminLayout>
      <div className="h-full flex flex-col bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {pendingCount > 0 && (
              <button
                onClick={handleSync}
                disabled={syncing || !isOnline}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200 disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {pendingCount} Pending
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Products Panel */}
          <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products or scan barcode..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CA2A31]"
                  autoFocus
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-8 h-8 border-4 border-[#CA2A31] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-[#CA2A31] transition-all text-left"
                    >
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">SKU: {product.custom_id || product.id}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-[#CA2A31]">{formatINR(product.price)}</span>
                        <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="w-96 bg-gray-50 flex flex-col">
            {/* Customer Info */}
            <div className="p-4 bg-white border-b border-gray-200">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name (Optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Phone (Optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product_id} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm flex-1">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-[#CA2A31]">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Total */}
            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-[#CA2A31]">
                    {formatINR(calculateTotal())}
                  </span>
                </div>

                {!showPayment ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-[#CA2A31] text-white py-3 rounded-lg font-semibold hover:bg-[#a82228] transition-all"
                    >
                      Proceed to Payment
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
                    >
                      Clear Cart
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                          paymentMethod === 'cash'
                            ? 'border-[#CA2A31] bg-red-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <DollarSign size={20} />
                        <span className="text-xs font-medium">Cash</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                          paymentMethod === 'card'
                            ? 'border-[#CA2A31] bg-red-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <CreditCard size={20} />
                        <span className="text-xs font-medium">Card</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                          paymentMethod === 'upi'
                            ? 'border-[#CA2A31] bg-red-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <Smartphone size={20} />
                        <span className="text-xs font-medium">UPI</span>
                      </button>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="Cash Received"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                          autoFocus
                        />
                        {cashReceived && (
                          <div className="mt-2 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Change to Return:</div>
                            <div className="text-3xl font-bold text-green-700">
                              {formatINR(calculateChange())}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Printer size={18} />
                      Complete & Print
                    </button>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all"
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
        }
      `}</style>
    </KKAdminLayout>
  )
}
