import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Package, Search, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const emptyBundle = () => ({
  name: '',
  description: '',
  image_url: '',
  bundle_price: '',
  is_active: true,
  items: [] // [{ product_id, quantity }]
})

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBundle, setEditingBundle] = useState(null)
  const [form, setForm] = useState(emptyBundle())
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    loadBundles()
    loadProducts()
  }, [])

  const loadBundles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_items (
            id,
            quantity,
            products (
              id,
              name,
              price,
              images,
              custom_id
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBundles(data || [])
    } catch (error) {
      console.error('Error loading bundles:', error)
      toast.error('Failed to load bundles')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, custom_id, stock')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleEdit = (bundle) => {
    setEditingBundle(bundle.id)
    setForm({
      name: bundle.name,
      description: bundle.description || '',
      image_url: bundle.image_url || '',
      bundle_price: bundle.bundle_price,
      is_active: bundle.is_active,
      items: bundle.bundle_items.map(item => ({
        product_id: item.products.id,
        quantity: item.quantity
      }))
    })
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingBundle(null)
    setForm(emptyBundle())
    setShowModal(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      return toast.error('Only image files allowed')
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Image must be < 10MB')
    }

    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `bundles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)
      
      setForm(f => ({ ...f, image_url: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Bundle name is required')
    if (!form.bundle_price || parseFloat(form.bundle_price) <= 0) {
      return toast.error('Bundle price is required')
    }
    if (form.items.length === 0) {
      return toast.error('Add at least one product to the bundle')
    }

    setSaving(true)
    try {
      const bundleData = {
        name: form.name.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || null,
        bundle_price: parseFloat(form.bundle_price),
        is_active: form.is_active
      }

      let bundleId = editingBundle

      if (editingBundle) {
        // Update existing bundle
        const { error } = await supabase
          .from('bundles')
          .update(bundleData)
          .eq('id', editingBundle)

        if (error) throw error

        // Delete old bundle items
        await supabase.from('bundle_items').delete().eq('bundle_id', editingBundle)
      } else {
        // Create new bundle
        const { data, error } = await supabase
          .from('bundles')
          .insert(bundleData)
          .select()
          .single()

        if (error) throw error
        bundleId = data.id
      }

      // Insert bundle items
      const itemsToInsert = form.items.map(item => ({
        bundle_id: bundleId,
        product_id: item.product_id,
        quantity: item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      toast.success(editingBundle ? 'Bundle updated!' : 'Bundle created!')
      setShowModal(false)
      loadBundles()
    } catch (error) {
      console.error('Error saving bundle:', error)
      toast.error('Failed to save bundle')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bundle?')) return

    try {
      const { error } = await supabase.from('bundles').delete().eq('id', id)
      if (error) throw error
      toast.success('Bundle deleted')
      loadBundles()
    } catch (error) {
      console.error('Error deleting bundle:', error)
      toast.error('Failed to delete bundle')
    }
  }

  const addProduct = (product) => {
    if (form.items.some(item => item.product_id === product.id)) {
      return toast.error('Product already added')
    }
    setForm(f => ({
      ...f,
      items: [...f.items, { product_id: product.id, quantity: 1 }]
    }))
    setProductSearch('')
  }

  const removeProduct = (productId) => {
    setForm(f => ({
      ...f,
      items: f.items.filter(item => item.product_id !== productId)
    }))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return
    setForm(f => ({
      ...f,
      items: f.items.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    }))
  }

  const getProductById = (id) => products.find(p => p.id === id)

  const calculateOriginalPrice = () => {
    return form.items.reduce((sum, item) => {
      const product = getProductById(item.product_id)
      return sum + (product?.price || 0) * item.quantity
    }, 0)
  }

  const filteredBundles = bundles.filter(b =>
    searchQuery.trim() === '' ||
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProducts = products.filter(p =>
    productSearch.trim() === '' ||
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.custom_id && p.custom_id.toLowerCase().includes(productSearch.toLowerCase()))
  )

  return (
    <KKAdminLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000', margin: 0 }}>Product Bundles</h1>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>Create kits and packs to recommend to customers</p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#CA2A31',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            New Bundle
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bundles..."
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        {/* Bundles List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filteredBundles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No bundles found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredBundles.map(bundle => {
              const originalPrice = bundle.bundle_items.reduce((sum, item) => 
                sum + (item.products.price * item.quantity), 0
              )
              const savings = originalPrice - bundle.bundle_price
              const savingsPercent = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(0) : 0

              return (
                <div key={bundle.id} style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {bundle.image_url && (
                    <img src={bundle.image_url} alt={bundle.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, flex: 1 }}>{bundle.name}</h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: bundle.is_active ? '#D1FAE5' : '#FEE2E2',
                        color: bundle.is_active ? '#065F46' : '#991B1B'
                      }}>
                        {bundle.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {bundle.description && (
                      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '12px', lineHeight: 1.4 }}>
                        {bundle.description}
                      </p>
                    )}

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px' }}>
                        {bundle.bundle_items.length} products
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {bundle.bundle_items.slice(0, 3).map((item, idx) => (
                          <div key={idx} style={{
                            padding: '4px 8px',
                            background: '#F5F5F5',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#333'
                          }}>
                            {item.products.name} x{item.quantity}
                          </div>
                        ))}
                        {bundle.bundle_items.length > 3 && (
                          <div style={{ padding: '4px 8px', color: '#666', fontSize: '0.75rem' }}>
                            +{bundle.bundle_items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'line-through' }}>
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#CA2A31' }}>
                            ₹{bundle.bundle_price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          background: '#FEF3C7',
                          color: '#92400E',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                          Save {savingsPercent}%
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(bundle)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#F5F5F5',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bundle.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#FEE2E2',
                          color: '#991B1B',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {editingBundle ? 'Edit Bundle' : 'New Bundle'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Bundle Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Bundle Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Complete Paint Kit"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe what's included..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Bundle Image
                    </label>
                    
                    {/* Image Preview */}
                    {form.image_url && (
                      <div style={{ marginBottom: '10px', position: 'relative', width: '200px', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={form.image_url} alt="Bundle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: '#EF4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      background: uploadingImage ? '#E5E5E5' : '#F5F5F5',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      marginBottom: '10px'
                    }}>
                      {uploadingImage ? (
                        <>
                          <div style={{ width: '16px', height: '16px', border: '2px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload from Device
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>
                    
                    {/* Or paste URL */}
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>Or paste image URL:</div>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>

                  {/* Bundle Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                      Bundle Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={form.bundle_price}
                      onChange={(e) => setForm(f => ({ ...f, bundle_price: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                      required
                    />
                    {form.items.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#666' }}>
                        Original Price: ₹{calculateOriginalPrice().toLocaleString('en-IN')} • 
                        Savings: ₹{(calculateOriginalPrice() - parseFloat(form.bundle_price || 0)).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Active Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="is_active" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                      Active (visible to customers)
                    </label>
                  </div>

                  {/* Products Section */}
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Bundle Products</h3>

                    {/* Add Product Search */}
                    <div style={{ marginBottom: '16px' }}>
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products to add..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '0.875rem'
                        }}
                      />
                      {productSearch && filteredProducts.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          maxHeight: '200px',
                          overflow: 'auto',
                          background: '#fff'
                        }}>
                          {filteredProducts.slice(0, 5).map(product => (
                            <div
                              key={product.id}
                              onClick={() => addProduct(product)}
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                            >
                              <div style={{ fontSize: '0.875rem' }}>
                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                  {product.custom_id} • ₹{product.price}
                                </div>
                              </div>
                              <Plus size={16} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Products */}
                    {form.items.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#999', background: '#f9f9f9', borderRadius: '8px' }}>
                        No products added yet
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {form.items.map((item) => {
                          const product = getProductById(item.product_id)
                          if (!product) return null
                          return (
                            <div key={item.product_id} style={{
                              padding: '12px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: '#fafafa'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{product.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                  {product.custom_id} • ₹{product.price} each
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                                  min="1"
                                  style={{
                                    width: '60px',
                                    padding: '6px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    textAlign: 'center'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProduct(item.product_id)}
                                  style={{
                                    padding: '6px',
                                    background: '#FEE2E2',
                                    color: '#991B1B',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#f5f5f5',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#CA2A31',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Bundle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </KKAdminLayout>
  )
}
