import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, Package, ShoppingBag, Settings, Star, Tag, CheckCircle, TrendingUp, Users, DollarSign } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingReviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: 'Xtreme Kolorz',
    stock: 10,
    images: [],
    tags: []
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    
    if (activeTab === 'dashboard') {
      await Promise.all([loadProducts(), loadOrders(), loadReviews()])
      calculateStats()
    } else if (activeTab === 'products') {
      await loadProducts()
    } else if (activeTab === 'orders') {
      await loadOrders()
    } else if (activeTab === 'reviews') {
      await loadReviews()
    }
    
    setLoading(false)
  }

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) setProducts(data)
  }

  const loadOrders = async () => {
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
    
    if (!error && data) setOrders(data)
  }

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) setReviews(data)
  }

  const calculateStats = () => {
    const totalProducts = products.length
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.order_status)).length
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    const pendingReviews = reviews.filter(r => !r.is_approved).length
    
    setStats({ totalProducts, activeOrders, totalRevenue, pendingReviews })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: parseInt(formData.stock)
    }

    if (editing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editing)
      
      if (error) {
        toast.error('Failed to update product')
      } else {
        toast.success('Product updated!')
        setEditing(null)
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData])
      
      if (error) {
        toast.error('Failed to create product')
      } else {
        toast.success('Product created!')
      }
    }
    
    setShowForm(false)
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      category: 'Xtreme Kolorz',
      stock: 10,
      images: [],
      tags: []
    })
    loadProducts()
  }

  const handleEdit = (product) => {
    setEditing(product.id)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || '',
      category: product.category,
      stock: product.stock,
      images: product.images || [],
      tags: product.tags || []
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Failed to delete product')
    } else {
      toast.success('Product deleted')
      loadProducts()
    }
  }

  const handleImageUrlChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] })
  }

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const handleImageUpload = async (e, index = null) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // Update form data
      const newImages = [...formData.images]
      if (index !== null) {
        newImages[index] = publicUrl
      } else {
        newImages.push(publicUrl)
      }
      setFormData({ ...formData, images: newImages })

      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId)
    
    if (error) {
      toast.error('Failed to update order')
    } else {
      toast.success('Order updated!')
      loadOrders()
    }
  }

  const deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Failed to delete review')
    } else {
      toast.success('Review deleted')
      loadReviews()
    }
  }

  const toggleReviewApproval = async (id, currentStatus) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: !currentStatus })
      .eq('id', id)
    
    if (error) {
      toast.error('Failed to update review status')
    } else {
      toast.success(`Review ${!currentStatus ? 'approved' : 'unapproved'}!`)
      loadReviews()
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> }
  ]

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Kustom Koats</title>
      </Helmet>

      <div className="min-h-screen flex" style={{ background: "#1A1A1A" }}>
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0" style={{ background: "#0A0A0A", borderRight: "1px solid #2A2A2A" }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#FF0000" }}>
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>
                  KUSTOM KOATS
                </h2>
                <p className="text-xs text-gray-500">ADMIN PANEL</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    background: activeTab === item.id ? "#FF0000" : "transparent",
                    color: activeTab === item.id ? "#FFFFFF" : "#999999",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <Link 
                to="/"
                className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-white transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <ArrowLeft size={20} />
                <span>Back to Website</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="px-8 py-6" style={{ borderBottom: "1px solid #2A2A2A" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-gray-400 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {activeTab === 'dashboard' && "Welcome back. Here's what's happening at Kustom Koats."}
                  {activeTab === 'products' && "Manage your automotive pearl products"}
                  {activeTab === 'orders' && "Track and manage customer orders"}
                  {activeTab === 'reviews' && "Moderate customer testimonials"}
                </p>
              </div>
              {activeTab === 'products' && (
                <button
                  onClick={() => {
                    setShowForm(true)
                    setEditing(null)
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      original_price: '',
                      category: 'Xtreme Kolorz',
                      stock: 10,
                      images: [],
                      tags: []
                    })
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
                  style={{ background: "#FF0000", fontFamily: "'Inter', sans-serif" }}
                >
                  <Plus size={20} />
                  Add Product
                </button>
              )}
            </div>
          </div>

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="rounded-xl p-6" style={{ background: "#8B2635", border: "1px solid #9B3645" }}>
                  <div className="flex items-center justify-between mb-4">
                    <Package size={24} className="text-white opacity-80" />
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold mb-1">{stats.totalProducts}</p>
                    <p className="text-white text-sm opacity-80">Total Products</p>
                    <p className="text-xs text-white opacity-60 mt-2">All items</p>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ background: "#8B2635", border: "1px solid #9B3645" }}>
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag size={24} className="text-white opacity-80" />
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold mb-1">{stats.activeOrders}</p>
                    <p className="text-white text-sm opacity-80">Active Orders</p>
                    <p className="text-xs text-white opacity-60 mt-2">Orders in progress</p>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ background: "#8B2635", border: "1px solid #9B3645" }}>
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign size={24} className="text-white opacity-80" />
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold mb-1">₹{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-white text-sm opacity-80">Total Revenue</p>
                    <p className="text-xs text-white opacity-60 mt-2">All time</p>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ background: "#8B2635", border: "1px solid #9B3645" }}>
                  <div className="flex items-center justify-between mb-4">
                    <Star size={24} className="text-white opacity-80" />
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold mb-1">{stats.pendingReviews}</p>
                    <p className="text-white text-sm opacity-80">Pending Reviews</p>
                    <p className="text-xs text-white opacity-60 mt-2">Awaiting approval</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-xl p-6 mb-8" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Recent Orders ({orders.length} total)
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-red-500 hover:text-red-400 font-medium"
                  >
                    View all →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} style={{ borderBottom: "1px solid #1A1A1A" }}>
                          <td className="px-4 py-4 text-sm text-white font-medium">
                            {order.display_order_id || order.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-4 text-sm text-white font-bold">
                            ₹{order.total_amount}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              order.order_status === 'delivered' ? 'bg-green-900/30 text-green-400' :
                              order.order_status === 'shipped' ? 'bg-blue-900/30 text-blue-400' :
                              order.order_status === 'processing' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-gray-800 text-gray-400'
                            }`}>
                              {order.order_status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            No orders yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-8">
              <div className="rounded-xl overflow-hidden" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: "#000000", borderBottom: "1px solid #2A2A2A" }}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Stock</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            Loading products...
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <p className="text-gray-500 mb-4 text-lg">No products yet</p>
                            <button
                              onClick={() => setShowForm(true)}
                              className="px-6 py-3 text-white rounded-lg font-bold transition-colors"
                              style={{ background: "#FF0000" }}
                            >
                              Add Your First Product
                            </button>
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} style={{ borderBottom: "1px solid #1A1A1A" }} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {product.images?.[0] && (
                                  <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover mr-4" />
                                )}
                                <div>
                                  <div className="text-sm font-bold text-white">{product.name}</div>
                                  <div className="text-xs text-gray-500">{product.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">{product.category}</td>
                            <td className="px-6 py-4 text-sm font-bold text-white">₹{product.price}</td>
                            <td className="px-6 py-4 text-sm text-gray-300">{product.stock}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-gray-400 hover:text-[#FF0000] mr-4 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-gray-400 hover:text-[#FF0000] transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-8">
              <div className="rounded-xl overflow-hidden" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: "#000000", borderBottom: "1px solid #2A2A2A" }}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            Loading orders...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-lg">No orders yet</p>
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} style={{ borderBottom: "1px solid #1A1A1A" }} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-white">
                                {order.display_order_id || order.id.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-white">
                              ₹{order.total_amount}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.order_status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="px-3 py-1 rounded-lg text-sm font-bold"
                                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs text-gray-400">
                                {order.order_items?.length || 0} items
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-8">
              <div className="rounded-xl overflow-hidden" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: "#000000", borderBottom: "1px solid #2A2A2A" }}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Rating</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Review</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            Loading reviews...
                          </td>
                        </tr>
                      ) : reviews.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-lg">No reviews yet</p>
                          </td>
                        </tr>
                      ) : (
                        reviews.map((review) => (
                          <tr key={review.id} style={{ borderBottom: "1px solid #1A1A1A" }} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-bold text-white">
                                  {review.name || 'Anonymous'}
                                </div>
                                {review.guest_email && (
                                  <div className="text-xs text-gray-500">
                                    {review.guest_email}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={i < review.rating ? "#FF0000" : "none"}
                                    stroke={i < review.rating ? "#FF0000" : "#666666"}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                              {review.review}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleReviewApproval(review.id, review.is_approved)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                  review.is_approved
                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                    : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                                }`}
                              >
                                {review.is_approved ? 'Approved' : 'Pending'}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="text-gray-400 hover:text-[#FF0000] transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Product Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
              <div className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {editing ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                        placeholder="e.g., Pearl Red Metallic"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                        rows="3"
                        placeholder="Describe the product..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Price (₹) *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                          placeholder="2999"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Original Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                          placeholder="3999"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Category *</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                        >
                          <option value="Xtreme Kolorz">Xtreme Kolorz</option>
                          <option value="Xtreme Wrap">Xtreme Wrap</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Stock *</label>
                        <input
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">Product Images</label>
                      <p className="text-xs text-gray-500 mb-3">Upload images or paste image URLs</p>
                      
                      {formData.images.map((img, index) => (
                        <div key={index} className="mb-4">
                          {/* Image Preview */}
                          {img && (
                            <div className="mb-2">
                              <img 
                                src={img} 
                                alt={`Product ${index + 1}`} 
                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-700"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            </div>
                          )}
                          
                          {/* URL Input and Upload Button */}
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={img}
                              onChange={(e) => handleImageUrlChange(index, e.target.value)}
                              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                              style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                              placeholder="https://example.com/image.jpg or upload file"
                            />
                            
                            {/* Upload Button */}
                            <label
                              className="px-4 py-3 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                              style={{ background: "#00A86B" }}
                            >
                              <Package size={18} />
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, index)}
                                className="hidden"
                                disabled={uploadingImage}
                              />
                            </label>
                            
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removeImageField(index)}
                              className="px-4 py-3 text-white rounded-lg transition-colors"
                              style={{ background: "#FF0000" }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add New Image Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={addImageField}
                          className="text-sm font-bold text-red-500 hover:text-red-400"
                        >
                          + Add Image URL
                        </button>
                        
                        <label className="text-sm font-bold text-green-500 hover:text-green-400 cursor-pointer">
                          + Upload New Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e)}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      
                      {uploadingImage && (
                        <p className="text-sm text-yellow-500 mt-2">Uploading image...</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-lg font-bold transition-all hover:scale-105"
                        style={{ background: "#FF0000" }}
                      >
                        <Save size={20} />
                        {editing ? 'Update Product' : 'Create Product'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-4 text-gray-300 rounded-lg font-bold transition-colors hover:bg-white/5"
                        style={{ border: "1px solid #2A2A2A" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
