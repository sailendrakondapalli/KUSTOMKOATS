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
      const element = invoiceRef.current
      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice-${order.display_order_id || order.id}.pdf`)
      
      toast.success('Invoice downloaded!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  const printInvoice = () => {
    window.print()
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">ERP System</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'invoices'
                ? 'bg-[#CA2A31] text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText size={18} />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'labels'
                ? 'bg-[#CA2A31] text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Package size={18} />
            Product Labels
          </button>
        </div>

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order List */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {orders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedOrder?.id === order.id
                        ? 'bg-[#CA2A31] text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">
                        {order.display_order_id || `#${order.id}`}
                      </span>
                      <span className="text-sm">{formatINR(order.total_amount)}</span>
                    </div>
                    <div className="text-sm opacity-80">
                      {order.guest_name || 'Guest'} • {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-gray-900 rounded-xl p-6">
              {selectedOrder ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => generateInvoicePDF(selectedOrder)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#CA2A31] text-white px-4 py-2 rounded-lg hover:bg-[#a82228] transition-all disabled:opacity-50"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                    <button
                      onClick={printInvoice}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>

                  {/* Invoice Template */}
                  <div
                    ref={invoiceRef}
                    className="bg-white text-black p-8 rounded-lg"
                    style={{ minHeight: '800px' }}
                  >
                    <div className="border-b-2 border-gray-300 pb-4 mb-6">
                      <h1 className="text-3xl font-bold text-[#CA2A31]">KUSTOM KOATS</h1>
                      <p className="text-sm text-gray-600">Premium Automotive Coatings</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="font-semibold mb-2">Bill To:</h3>
                        <p className="text-sm">{selectedOrder.guest_name || 'N/A'}</p>
                        <p className="text-sm">{selectedOrder.guest_email || 'N/A'}</p>
                        <p className="text-sm">{selectedOrder.guest_phone || 'N/A'}</p>
                        {selectedOrder.address && (
                          <p className="text-sm mt-2">{JSON.parse(selectedOrder.address).address1}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <h3 className="font-semibold mb-2">Invoice Details:</h3>
                        <p className="text-sm">Invoice #: {selectedOrder.display_order_id || selectedOrder.id}</p>
                        <p className="text-sm">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                        <p className="text-sm">Payment: {selectedOrder.payment_method || 'N/A'}</p>
                        <p className="text-sm">Status: <span className="font-semibold">{selectedOrder.payment_status}</span></p>
                      </div>
                    </div>

                    <table className="w-full mb-6">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="text-left p-2 text-sm">Item</th>
                          <th className="text-center p-2 text-sm">Qty</th>
                          <th className="text-right p-2 text-sm">Price</th>
                          <th className="text-right p-2 text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items?.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2 text-sm">{item.products?.name || 'Product'}</td>
                            <td className="text-center p-2 text-sm">{item.quantity}</td>
                            <td className="text-right p-2 text-sm">{formatINR(item.price)}</td>
                            <td className="text-right p-2 text-sm">{formatINR(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-end mb-8">
                      <div className="w-64">
                        <div className="flex justify-between py-2 border-t">
                          <span className="font-semibold">Total Amount:</span>
                          <span className="font-bold text-lg">{formatINR(selectedOrder.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-600 mt-12 pt-6 border-t">
                      <p>Thank you for your business!</p>
                      <p>For support, contact: support@kustomkoats.com</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-20">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select an order to view invoice</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Labels Tab */}
        {activeTab === 'labels' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product List */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Products</h2>
                <button
                  onClick={selectAllProducts}
                  className="text-sm text-[#CA2A31] hover:underline"
                >
                  {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {products.map(product => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="w-4 h-4 accent-[#CA2A31]"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-sm text-gray-400">
                        SKU: {product.custom_id || product.id} • {formatINR(product.price)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedProducts.length > 0 && (
                <button
                  onClick={downloadBulkLabels}
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-[#CA2A31] text-white px-4 py-3 rounded-lg hover:bg-[#a82228] transition-all disabled:opacity-50"
                >
                  <Download size={16} />
                  Download {selectedProducts.length} Label{selectedProducts.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Label Preview */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Label Preview</h2>
              {selectedProducts.length > 0 ? (
                <div
                  ref={labelRef}
                  className="bg-white p-6 rounded-lg space-y-6 max-h-[600px] overflow-y-auto"
                >
                  {products
                    .filter(p => selectedProducts.includes(p.id))
                    .map(product => (
                      <ProductLabel key={product.id} product={product} />
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-20">
                  <QrCode size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select products to generate labels</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print, #invoice-print * {
            visibility: visible;
          }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
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
