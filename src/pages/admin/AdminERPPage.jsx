import { useState, useEffect, useRef } from 'react'
import { FileText, QrCode, Barcode, Download, Printer, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import BarcodeComponent from 'react-barcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatINR } from '../../utils/format'
import { generateBrandedInvoice, printBrandedInvoice } from '../../utils/brandedInvoiceGenerator'

export default function AdminERPPage() {
  const [activeTab, setActiveTab] = useState('invoices') // invoices | labels
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const invoiceRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      toast.error('Failed to load orders')
      return
    }
    setOrders(data || [])
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) {
      toast.error('Failed to load products')
      return
    }
    setProducts(data || [])
  }

  const generateInvoicePDF = async (order) => {
    setLoading(true)
    try {
      // Parse address if it exists
      const addr = order.address ? (typeof order.address === 'string' ? JSON.parse(order.address) : order.address) : {}
      
      const preparedOrder = {
        ...order,
        parsedAddress: addr
      }
      
      const siteUrl = window.location.origin
      await generateBrandedInvoice(preparedOrder, siteUrl)
      
      toast.success('Invoice downloaded!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  const printInvoice = async () => {
    if (!selectedOrder) return
    
    setLoading(true)
    try {
      // Parse address if it exists
      const addr = selectedOrder.address ? (typeof selectedOrder.address === 'string' ? JSON.parse(selectedOrder.address) : selectedOrder.address) : {}
      
      const preparedOrder = {
        ...selectedOrder,
        parsedAddress: addr
      }
      
      const siteUrl = window.location.origin
      await printBrandedInvoice(preparedOrder, siteUrl)
      
      toast.success('Opening print dialog...')
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Failed to print invoice')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = async (product) => {
    try {
      const qrData = JSON.stringify({
        id: product.id,
        custom_id: product.custom_id,
        name: product.name,
        price: product.price,
        url: `https://kustomkoats.in/products/${product.id}`
      })
      
      const qrCodeURL = await QRCode.toDataURL(qrData, { width: 300 })
      
      const link = document.createElement('a')
      link.href = qrCodeURL
      link.download = `QR-${product.custom_id || product.id}.png`
      link.click()
      
      toast.success('QR Code downloaded!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  const downloadBulkLabels = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select products')
      return
    }

    setLoading(true)
    try {
      const element = labelRef.current
      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Product-Labels-${Date.now()}.pdf`)
      
      toast.success('Labels downloaded!')
    } catch (error) {
      console.error('Label generation error:', error)
      toast.error('Failed to generate labels')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  return (
    <KKAdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ERP System</h1>
            <p className="text-gray-600 mt-1">Invoice & Label Management</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'bg-[#CA2A31] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <FileText size={20} />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'labels'
                ? 'bg-[#CA2A31] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Package size={20} />
            Product Labels
          </button>
        </div>

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <FileText size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No orders found</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-4 rounded-lg transition-all border-2 ${
                        selectedOrder?.id === order.id
                          ? 'bg-red-50 border-[#CA2A31] shadow-sm'
                          : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-base text-gray-900">
                          {order.display_order_id || `#${order.id}`}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{formatINR(order.total_amount)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.guest_name || 'Guest'} • {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {selectedOrder ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Actions</h2>
                  <p className="text-gray-600 mb-4">Generate professional branded invoice with watermark and QR codes</p>
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => generateInvoicePDF(selectedOrder)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#CA2A31] text-white px-4 py-3 rounded-lg hover:bg-[#a82228] transition-all disabled:opacity-50 font-semibold shadow-lg"
                    >
                      <Download size={18} />
                      {loading ? 'Generating...' : 'Download PDF'}
                    </button>
                    <button
                      onClick={printInvoice}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 font-semibold"
                    >
                      <Printer size={18} />
                      {loading ? 'Generating...' : 'Print'}
                    </button>
                  </div>

                  {/* Order Summary Card */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Number</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.display_order_id || `#${selectedOrder.id}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Customer</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.guest_name || 'Walk-in Customer'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                        <p className="font-semibold text-gray-900 capitalize">{selectedOrder.payment_status}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Items</span>
                        <span className="font-medium text-gray-900">{selectedOrder.order_items?.length || 0} products</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                        <span className="text-2xl font-bold text-[#CA2A31]">{formatINR(selectedOrder.total_amount)}</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-3">
                        <FileText className="text-blue-600 flex-shrink-0" size={20} />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Branded Invoice Format</p>
                          <p className="text-blue-700">The generated PDF will include KUSTOMKOATS watermark, product QR codes, GST details, and professional formatting.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-20">
                  <FileText size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-semibold text-gray-700">Select an order to view invoice</p>
                  <p className="text-sm text-gray-500 mt-2">Choose an order from the list to generate PDF</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Labels Tab */}
        {activeTab === 'labels' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <button
                  onClick={selectAllProducts}
                  className="text-sm text-[#CA2A31] hover:text-[#a82228] hover:underline font-semibold"
                >
                  {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {products.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Package size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No products found</p>
                  </div>
                ) : (
                  products.map(product => (
                    <label
                      key={product.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all border-2 border-transparent hover:border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-5 h-5 accent-[#CA2A31]"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 font-semibold text-base">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          SKU: {product.custom_id || product.id} • {formatINR(product.price)}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedProducts.length > 0 && (
                <button
                  onClick={downloadBulkLabels}
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-[#CA2A31] text-white px-4 py-3 rounded-lg hover:bg-[#a82228] transition-all disabled:opacity-50 font-semibold shadow-lg"
                >
                  <Download size={20} />
                  Download {selectedProducts.length} Label{selectedProducts.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Label Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Label Preview</h2>
              {selectedProducts.length > 0 ? (
                <div
                  ref={labelRef}
                  className="bg-white p-6 rounded-lg space-y-6 max-h-[600px] overflow-y-auto border border-gray-200"
                >
                  {products
                    .filter(p => selectedProducts.includes(p.id))
                    .map(product => (
                      <ProductLabel key={product.id} product={product} />
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-20">
                  <QrCode size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-semibold text-gray-700">Select products to generate labels</p>
                  <p className="text-sm text-gray-500 mt-2">Choose products from the list to preview labels</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
    </KKAdminLayout>
  )
}

// Product Label Component
function ProductLabel({ product }) {
  const [qrCodeURL, setQRCodeURL] = useState('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: product.id,
          custom_id: product.custom_id,
          name: product.name,
          price: product.price,
          url: `https://kustomkoats.in/products/${product.id}`
        })
        const url = await QRCode.toDataURL(qrData, { width: 200 })
        setQRCodeURL(url)
      } catch (error) {
        console.error('QR generation error:', error)
      }
    }
    generateQR()
  }, [product])

  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 page-break-inside-avoid">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-black">{product.name}</h3>
        <p className="text-sm text-gray-600">SKU: {product.custom_id || product.id}</p>
        <p className="text-sm text-gray-600">{formatINR(product.price)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* QR Code */}
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 font-semibold">QR CODE</p>
          {qrCodeURL && (
            <img src={qrCodeURL} alt="QR Code" className="w-32 h-32 mx-auto" />
          )}
        </div>

        {/* Barcode */}
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2 font-semibold">BARCODE</p>
          <div className="flex items-center justify-center">
            <BarcodeComponent
              value={product.custom_id || `PRD${product.id.toString().padStart(8, '0')}`}
              width={1.5}
              height={60}
              fontSize={12}
              background="#ffffff"
              lineColor="#000000"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
