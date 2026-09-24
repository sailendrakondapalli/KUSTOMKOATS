import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
  Plus, Edit2, Trash2, Save, X, Search,
  Package, ShoppingBag, Tag, Users, TrendingUp,
  Image, Upload, ChevronDown, GripVertical,
  DollarSign, AlertCircle, CheckCircle, BarChart2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const CATEGORIES_DEFAULT = ['Xtreme Kolorz', 'Xtreme Wrap', 'Accessories', 'Wholesale']

const emptyProduct = () => ({
  name: '', description: '', price: '', original_price: '',
  category: 'Xtreme Kolorz', stock: 10, custom_id: '',
  images: [], tags: [], size: '',
  techBars: [],    // [{ title, labels: ['a','b','c'], selected_value: 'b' }]
  techSpecs: [],   // [{ spec_name, spec_value }]
})

const emptyBar  = () => ({ title: '', labels: ['', '', ''], selected_value: '' })
const emptySpec = () => ({ spec_name: '', spec_value: '' })

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = '#FF0000' }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12,
      padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
        background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p style={{ color: '#999999', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// DASHBOARD TAB
// ─────────────────────────────────────────────
function DashboardTab({ products, orders }) {
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((s, o) => s + Number(o.total_amount || 0), 0)
  const pendingOrders = orders.filter(o =>
    ['pending', 'confirmed', 'processing'].includes(o.order_status)
  ).length
  const lowStock = products.filter(p => (p.stock || 0) < 10).length

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package}    label="Total Products" value={products.length} color="#FF0000" />
        <StatCard icon={ShoppingBag} label="Pending Orders" value={pendingOrders}   color="#F59E0B" />
        <StatCard icon={DollarSign} label="Total Revenue"  value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="#10B981" />
        <StatCard icon={AlertCircle} label="Low Stock"     value={lowStock}         color="#EF4444" />
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: "'Inter', sans-serif", color: '#000000' }}>
            Recent Orders
          </span>
          <Link to="/admin/orders" style={{ fontSize: '0.8125rem', color: '#FF0000', textDecoration: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            View all →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Order ID', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #F0F0F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #F8F8F8' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                    {order.display_order_id || order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                    ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={order.order_status} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#999999', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock */}
      {lowStock > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: "'Inter', sans-serif", color: '#000000' }}>
              Low Stock Alert
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {products.filter(p => (p.stock || 0) < 10).slice(0, 6).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #F8F8F8' }}>
                {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid #E5E5E5' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#999999', fontFamily: "'Inter', sans-serif" }}>{p.category}</p>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.stock === 0 ? '#EF4444' : '#F59E0B', background: p.stock === 0 ? '#FEF2F2' : '#FFFBEB', padding: '2px 10px', borderRadius: 999, fontFamily: "'Inter', sans-serif" }}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:    { bg: '#FFFBEB', color: '#D97706' },
    confirmed:  { bg: '#EFF6FF', color: '#2563EB' },
    processing: { bg: '#F5F3FF', color: '#7C3AED' },
    shipped:    { bg: '#F0FDF4', color: '#16A34A' },
    delivered:  { bg: '#F0FDF4', color: '#15803D' },
    cancelled:  { bg: '#FEF2F2', color: '#DC2626' },
    paid:       { bg: '#F0FDF4', color: '#16A34A' },
    failed:     { bg: '#FEF2F2', color: '#DC2626' },
  }
  const s = map[status] || { bg: '#F5F5F5', color: '#666666' }
  return (
    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontFamily: "'Inter', sans-serif", textTransform: 'capitalize' }}>
      {status || '—'}
    </span>
  )
}

// ─────────────────────────────────────────────
// TECHNICAL DETAILS EDITOR (inside product form)
// ─────────────────────────────────────────────
function TechDetailsEditor({ techBars, techSpecs, onChange }) {
  const updateBar = (i, field, val) => {
    const updated = techBars.map((b, idx) => idx === i ? { ...b, [field]: val } : b)
    onChange('techBars', updated)
  }
  const updateBarLabel = (barIdx, labelIdx, val) => {
    const updated = techBars.map((b, i) => {
      if (i !== barIdx) return b
      const labels = [...(b.labels || [])]
      labels[labelIdx] = val
      return { ...b, labels }
    })
    onChange('techBars', updated)
  }
  const addBarLabel = (barIdx) => {
    const updated = techBars.map((b, i) =>
      i === barIdx ? { ...b, labels: [...(b.labels || []), ''] } : b
    )
    onChange('techBars', updated)
  }
  const removeBarLabel = (barIdx, labelIdx) => {
    const updated = techBars.map((b, i) =>
      i === barIdx ? { ...b, labels: (b.labels || []).filter((_, li) => li !== labelIdx) } : b
    )
    onChange('techBars', updated)
  }
  const removeBar = (i) => onChange('techBars', techBars.filter((_, idx) => idx !== i))

  const updateSpec = (i, field, val) => {
    const updated = techSpecs.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    onChange('techSpecs', updated)
  }
  const removeSpec = (i) => onChange('techSpecs', techSpecs.filter((_, idx) => idx !== i))

  const S = { // inline styles shortcuts
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 4, display: 'block' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none' },
    sectionTitle: { fontSize: '0.875rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif", marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
    card: { background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 10, padding: 16, marginBottom: 12, position: 'relative' },
    removeBtn: { position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, borderRadius: 4 },
    addBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px dashed #CCCCCC', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' },
  }

  return (
    <div>
      {/* ── Technical Bars ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={S.sectionTitle}>
          <span>Interactive Technical Bars</span>
          <span style={{ fontSize: '0.6875rem', color: '#999999', fontWeight: 400 }}>(e.g. Color Vibe, Color Type)</span>
        </div>

        {techBars.map((bar, bi) => (
          <div key={bi} style={S.card}>
            <button style={S.removeBtn} type="button" onClick={() => removeBar(bi)} title="Remove bar"><X size={14} /></button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12, paddingRight: 28 }}>
              <div>
                <label style={S.label}>Bar Title</label>
                <input style={S.input} value={bar.title} onChange={e => updateBar(bi, 'title', e.target.value)} placeholder="e.g. Color Vibe" />
              </div>
              <div>
                <label style={S.label}>Selected Value</label>
                <select
                  style={S.input}
                  value={bar.selected_value}
                  onChange={e => updateBar(bi, 'selected_value', e.target.value)}
                >
                  <option value="">— choose —</option>
                  {(bar.labels || []).filter(Boolean).map((l, li) => (
                    <option key={li} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <label style={S.label}>Labels (left → right on bar)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {(bar.labels || []).map((lbl, li) => (
                <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    style={{ ...S.input, width: 100 }}
                    value={lbl}
                    onChange={e => updateBarLabel(bi, li, e.target.value)}
                    placeholder={`Label ${li + 1}`}
                  />
                  {(bar.labels || []).length > 2 && (
                    <button type="button" onClick={() => removeBarLabel(bi, li)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2 }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" style={S.addBtn} onClick={() => addBarLabel(bi)}>
                <Plus size={12} /> Label
              </button>
            </div>
          </div>
        ))}

        <button type="button" style={S.addBtn}
          onClick={() => onChange('techBars', [...techBars, emptyBar()])}>
          <Plus size={14} /> Add Technical Bar
        </button>
      </div>

      {/* ── Technical Specs ── */}
      <div>
        <div style={S.sectionTitle}>
          <span>Technical Specifications</span>
          <span style={{ fontSize: '0.6875rem', color: '#999999', fontWeight: 400 }}>(e.g. Paint Type, HVLP Tip Size)</span>
        </div>

        {techSpecs.map((spec, si) => (
          <div key={si} style={{ ...S.card, padding: '10px 16px' }}>
            <button style={S.removeBtn} type="button" onClick={() => removeSpec(si)} title="Remove spec"><X size={14} /></button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10, paddingRight: 24 }}>
              <div>
                <label style={S.label}>Specification Name</label>
                <input style={S.input} value={spec.spec_name} onChange={e => updateSpec(si, 'spec_name', e.target.value)} placeholder="e.g. Paint Type" />
              </div>
              <div>
                <label style={S.label}>Value</label>
                <input style={S.input} value={spec.spec_value} onChange={e => updateSpec(si, 'spec_value', e.target.value)} placeholder="e.g. Peelable Paint" />
              </div>
            </div>
          </div>
        ))}

        <button type="button" style={S.addBtn}
          onClick={() => onChange('techSpecs', [...techSpecs, emptySpec()])}>
          <Plus size={14} /> Add Specification
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PRODUCT FORM MODAL
// ─────────────────────────────────────────────
function ProductFormModal({ initialData, categories, onClose, onSaved }) {
  const [form, setForm] = useState(initialData || emptyProduct())
  const [saving, setSaving] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState(null)
  const [activeTab, setActiveTab] = useState('basic') // basic | technical

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return toast.error('Only image/video files allowed')
    }
    if (file.size > 20 * 1024 * 1024) return toast.error('File must be < 20MB')
    setUploadingIdx(idx)
    try {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      const imgs = [...form.images]
      if (idx < imgs.length) imgs[idx] = publicUrl
      else imgs.push(publicUrl)
      setField('images', imgs)
      toast.success('Uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingIdx(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Product name is required')
    if (!form.price) return toast.error('Price is required')
    setSaving(true)

    try {
      const productData = {
        name: form.name.trim(),
        description: form.description,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category: form.category,
        stock: parseInt(form.stock) || 0,
        custom_id: form.custom_id || null,
        images: form.images.filter(Boolean),
        tags: form.tags,
        size: form.size || null,
      }

      let productId = form.id

      if (productId) {
        // UPDATE
        const { error } = await supabase.from('products').update(productData).eq('id', productId)
        if (error) throw error
        toast.success('Product updated!')
      } else {
        // INSERT
        const { data, error } = await supabase.from('products').insert(productData).select().single()
        if (error) throw error
        productId = data.id
        toast.success('Product created!')
      }

      // Save technical bars
      await supabase.from('product_technical_bars').delete().eq('product_id', productId)
      if (form.techBars.length > 0) {
        const bars = form.techBars
          .filter(b => b.title.trim() && b.labels.some(l => l.trim()))
          .map((b, i) => ({
            product_id: productId,
            title: b.title.trim(),
            labels: b.labels.filter(l => l.trim()),
            selected_value: b.selected_value || b.labels.find(l => l.trim()) || '',
            sort_order: i,
          }))
        if (bars.length > 0) {
          const { error: bErr } = await supabase.from('product_technical_bars').insert(bars)
          if (bErr) console.error('bars error:', bErr.message)
        }
      }

      // Save technical specs
      await supabase.from('product_specifications').delete().eq('product_id', productId)
      if (form.techSpecs.length > 0) {
        const specs = form.techSpecs
          .filter(s => s.spec_name.trim() && s.spec_value.trim())
          .map((s, i) => ({
            product_id: productId,
            spec_name: s.spec_name.trim(),
            spec_value: s.spec_value.trim(),
            sort_order: i,
          }))
        if (specs.length > 0) {
          const { error: sErr } = await supabase.from('product_specifications').insert(specs)
          if (sErr) console.error('specs error:', sErr.message)
        }
      }

      onSaved()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const S = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' },
    modal: { background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 860, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', marginTop: 20, marginBottom: 20 },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F0F0F0' },
    body: { padding: '24px' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
    tab: (active) => ({
      padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8125rem',
      fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400,
      background: active ? '#FF0000' : 'transparent',
      color: active ? '#FFFFFF' : '#666666', transition: 'all 0.15s',
    }),
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        {/* Header */}
        <div style={S.header}>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.375rem', fontWeight: 700, color: '#000000', margin: 0 }}>
            {form.id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', padding: 4, borderRadius: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: 8, borderBottom: '1px solid #F0F0F0' }}>
          <button style={S.tab(activeTab === 'basic')} onClick={() => setActiveTab('basic')}>Basic Info</button>
          <button style={S.tab(activeTab === 'images')} onClick={() => setActiveTab('images')}>Images</button>
          <button style={S.tab(activeTab === 'technical')} onClick={() => setActiveTab('technical')}>Technical Details</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={S.body}>
            {/* ── BASIC TAB ── */}
            {activeTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={S.label}>Product Name *</label>
                    <input style={S.input} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Pearl Blue Metallic" required />
                  </div>
                  <div>
                    <label style={S.label}>Price (₹) *</label>
                    <input style={S.input} type="number" min="0" step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="999" required />
                  </div>
                  <div>
                    <label style={S.label}>Original Price (₹) — for discount</label>
                    <input style={S.input} type="number" min="0" step="0.01" value={form.original_price} onChange={e => setField('original_price', e.target.value)} placeholder="1299 (optional)" />
                  </div>
                  <div>
                    <label style={S.label}>Category *</label>
                    <select style={S.input} value={form.category} onChange={e => setField('category', e.target.value)}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Stock Quantity</label>
                    <input style={S.input} type="number" min="0" value={form.stock} onChange={e => setField('stock', e.target.value)} placeholder="10" />
                  </div>
                  <div>
                    <label style={S.label}>SKU / Custom ID</label>
                    <input style={S.input} value={form.custom_id} onChange={e => setField('custom_id', e.target.value)} placeholder="KK-001" />
                  </div>
                  <div>
                    <label style={S.label}>Size/Variants (comma-separated)</label>
                    <input style={S.input} value={form.size} onChange={e => setField('size', e.target.value)} placeholder="50ml, 100ml, 250ml" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={S.label}>Tags (comma-separated)</label>
                    <input
                      style={S.input}
                      value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                      onChange={e => setField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      placeholder="metallic, pearl, automotive"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={S.label}>Description</label>
                    <textarea
                      style={{ ...S.input, height: 100, resize: 'vertical' }}
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="Describe the product..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── IMAGES TAB ── */}
            {activeTab === 'images' && (
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
                  Upload images or paste public URLs. First image is the main product image.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {[...Array(Math.max(form.images.length + 1, 4))].map((_, idx) => {
                    const url = form.images[idx] || ''
                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        {/* Preview */}
                        <div style={{ aspectRatio: '1', border: '2px dashed #E0E0E0', borderRadius: 10, overflow: 'hidden', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                          {url ? (
                            <>
                              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                              <button
                                type="button"
                                onClick={() => setField('images', form.images.filter((_, i) => i !== idx))}
                                style={{ position: 'absolute', top: 4, right: 4, background: '#EF4444', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}
                              ><X size={12} /></button>
                            </>
                          ) : uploadingIdx === idx ? (
                            <div style={{ textAlign: 'center', color: '#999999' }}>
                              <div style={{ width: 24, height: 24, border: '2px solid #FF0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 6px' }} />
                              <span style={{ fontSize: '0.6875rem' }}>Uploading...</span>
                            </div>
                          ) : (
                            <label style={{ cursor: 'pointer', textAlign: 'center', color: '#CCCCCC', padding: 12 }}>
                              <Upload size={24} style={{ margin: '0 auto 4px', display: 'block' }} />
                              <span style={{ fontSize: '0.6875rem', fontFamily: "'Inter', sans-serif" }}>Upload</span>
                              <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, idx)} />
                            </label>
                          )}
                        </div>
                        {/* URL input */}
                        <input
                          style={{ ...S.input, fontSize: '0.6875rem', padding: '5px 8px' }}
                          value={url}
                          onChange={e => {
                            const imgs = [...form.images]
                            if (idx < imgs.length) imgs[idx] = e.target.value
                            else imgs.push(e.target.value)
                            setField('images', imgs)
                          }}
                          placeholder="or paste URL"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── TECHNICAL TAB ── */}
            {activeTab === 'technical' && (
              <TechDetailsEditor
                techBars={form.techBars}
                techSpecs={form.techSpecs}
                onChange={(key, val) => setField(key, val)}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 20px', border: '1px solid #E0E0E0', borderRadius: 8, background: '#FFFFFF', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#666666' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '9px 24px', border: 'none', borderRadius: 8, background: saving ? '#FFAAAA' : '#FF0000', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              {saving ? <><div style={{ width: 14, height: 14, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> {form.id ? 'Save Changes' : 'Create Product'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PRODUCTS TAB
// ─────────────────────────────────────────────
function ProductsTab({ products, categories, onRefresh }) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    return (
      (!q || p.name?.toLowerCase().includes(q) || (p.custom_id || '').toLowerCase().includes(q)) &&
      (!catFilter || p.category === catFilter)
    )
  })

  const handleEdit = async (product) => {
    // Fetch tech bars + specs for this product
    const [barsRes, specsRes] = await Promise.all([
      supabase.from('product_technical_bars').select('*').eq('product_id', product.id).order('sort_order'),
      supabase.from('product_specifications').select('*').eq('product_id', product.id).order('sort_order'),
    ])
    setEditData({
      ...product,
      techBars: (barsRes.data || []).map(b => ({ ...b, labels: b.labels || [] })),
      techSpecs: specsRes.data || [],
    })
    setShowForm(true)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Product deleted'); onRefresh() }
    setDeleting(null)
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#AAAAAA' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000000', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => { setEditData(null); setShowForm(true) }}
          style={{ padding: '8px 18px', background: '#FF0000', border: 'none', borderRadius: 7, color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif", flexShrink: 0 }}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Product', 'Category', 'Price', 'Stock', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #F0F0F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#AAAAAA', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
                  {search || catFilter ? 'No products match your search.' : 'No products yet. Add your first product.'}
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F8F8F8', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 7, objectFit: 'cover', flexShrink: 0, border: '1px solid #E5E5E5' }} onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 7, background: '#F0F0F0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={16} style={{ color: '#CCCCCC' }} />
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>{p.name}</p>
                        {p.custom_id && <p style={{ fontSize: '0.6875rem', color: '#AAAAAA', fontFamily: "'Inter', sans-serif", margin: 0 }}>SKU: {p.custom_id}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555555', fontFamily: "'Inter', sans-serif" }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                    ₹{Number(p.price).toLocaleString('en-IN')}
                    {p.original_price && p.original_price > p.price && (
                      <span style={{ marginLeft: 6, fontSize: '0.6875rem', color: '#16A34A', fontWeight: 600, background: '#F0FDF4', padding: '1px 6px', borderRadius: 999 }}>
                        -{Math.round(((p.original_price - p.price) / p.original_price) * 100)}%
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999, fontFamily: "'Inter', sans-serif",
                      background: p.stock === 0 ? '#FEF2F2' : p.stock < 10 ? '#FFFBEB' : '#F0FDF4',
                      color: p.stock === 0 ? '#DC2626' : p.stock < 10 ? '#D97706' : '#16A34A',
                    }}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock}`}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '6px', borderRadius: 6, marginRight: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#FF0000'; e.currentTarget.style.background = '#FFF0F0' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#888888'; e.currentTarget.style.background = 'transparent' }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: '6px', borderRadius: 6, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#888888'; e.currentTarget.style.background = 'transparent' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product form modal */}
      {showForm && (
        <ProductFormModal
          initialData={editData}
          categories={categories}
          onClose={() => { setShowForm(false); setEditData(null) }}
          onSaved={() => { setShowForm(false); setEditData(null); onRefresh() }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function AdminProductsPage() {
  const [tab, setTab] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([...CATEGORIES_DEFAULT])
  const [loading, setLoading] = useState(true)

  const loadAll = async () => {
    setLoading(true)
    const [prodsRes, ordersRes, catsRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*, products(name, images, price))').order('created_at', { ascending: false }),
      supabase.from('categories').select('name').eq('is_active', true).order('sort_order'),
    ])
    if (prodsRes.data) setProducts(prodsRes.data)
    if (ordersRes.data) setOrders(ordersRes.data)
    if (catsRes.data?.length) setCategories(catsRes.data.map(c => c.name))
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'products',  label: 'Products',  icon: Package },
  ]

  return (
    <>
      <Helmet><title>Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Page tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? '#FF0000' : '#FFFFFF',
                color: tab === t.id ? '#FFFFFF' : '#444444',
                boxShadow: tab === t.id ? '0 2px 8px rgba(255,0,0,0.2)' : 'none',
                border: tab === t.id ? 'none' : '1px solid #E5E5E5',
                transition: 'all 0.15s',
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #FF0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <>
            {tab === 'dashboard' && <DashboardTab products={products} orders={orders} />}
            {tab === 'products'  && <ProductsTab products={products} categories={categories} onRefresh={loadAll} />}
          </>
        )}
      </KKAdminLayout>
    </>
  )
}
