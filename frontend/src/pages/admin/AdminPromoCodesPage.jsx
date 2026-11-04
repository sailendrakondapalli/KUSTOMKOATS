import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Edit2, Trash2, Save, X, Ticket, Copy, Check } from 'lucide-react'
import { fetchAllCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../../services/promoService'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const emptyForm = () => ({
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order_amount: 0,
  applicable_category: '',
  is_one_time: false,
  max_uses: null,
  expires_at: '',
  is_active: true,
  description: ''
})

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAllCodes()
      setCodes(data || [])
    } catch (err) {
      toast.error('Failed to load promo codes')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setShowForm(true) }
  const openEdit = (code) => {
    setEditing(code)
    setForm({
      ...code,
      expires_at: code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 16) : ''
    })
    setShowForm(true)
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code.code)
    setCopiedId(code.id)
    toast.success('Code copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) return toast.error('Promo code is required')
    if (!form.discount_value || form.discount_value <= 0) return toast.error('Discount value must be greater than 0')

    setSaving(true)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        applicable_category: form.applicable_category.trim() || null,
        is_one_time: form.is_one_time,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active !== false,
        description: form.description.trim() || null
      }

      if (editing?.id) {
        await updatePromoCode(editing.id, payload)
        toast.success('Promo code updated!')
      } else {
        await createPromoCode(payload)
        toast.success('Promo code created!')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete promo code "${code.code}"?`)) return
    setDeleting(code.id)
    try {
      await deletePromoCode(code.id)
      toast.success('Promo code deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
    setDeleting(null)
  }

  const handleToggleActive = async (code) => {
    try {
      await updatePromoCode(code.id, { is_active: !code.is_active })
      toast.success(code.is_active ? 'Promo code disabled' : 'Promo code enabled')
      load()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const S = {
    card: { background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modal: { background: '#FFFFFF', borderRadius: 14, width: '100%', maxWidth: 620, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflow: 'auto' },
  }

  return (
    <>
      <Helmet><title>Promo Codes | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Promo Codes</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Create and manage discount codes for customers
            </p>
          </div>
          <button onClick={openAdd}
            style={{ padding: '8px 18px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
            <Plus size={14} /> Add Promo Code
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={S.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                  {['Code', 'Discount', 'Min Order', 'Category', 'Expiry', 'Uses', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#999999', fontSize: '0.875rem' }}>
                      No promo codes yet. Click "Add Promo Code" to create one.
                    </td>
                  </tr>
                ) : (
                  codes.map(code => (
                    <tr key={code.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: '#000000', background: '#F5F5F5', padding: '4px 8px', borderRadius: 4 }}>
                            {code.code}
                          </span>
                          <button
                            onClick={() => handleCopy(code)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === code.id ? '#22C55E' : '#999999', padding: 4 }}
                            title="Copy code"
                          >
                            {copiedId === code.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        {code.description && (
                          <p style={{ fontSize: '0.75rem', color: '#666666', margin: '4px 0 0 0', maxWidth: 200 }}>
                            {code.description}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.875rem', color: '#000000', fontWeight: 600 }}>
                          {code.discount_type === 'percentage' ? `${code.discount_value}%` : `₹${code.discount_value}`}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#666666' }}>
                        {code.min_order_amount > 0 ? `₹${code.min_order_amount}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {code.applicable_category ? (
                          <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}>
                            {code.applicable_category}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.875rem', color: '#999999' }}>All</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#666666' }}>
                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#666666' }}>
                        {code.is_one_time ? 'One-time' : code.max_uses ? code.max_uses : '∞'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleActive(code)}
                          style={{
                            border: 'none',
                            background: code.is_active ? '#DCFCE7' : '#FEE2E2',
                            color: code.is_active ? '#16A34A' : '#DC2626',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif"
                          }}
                        >
                          {code.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(code)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666', padding: 4 }}
                            title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(code)}
                            disabled={deleting === code.id}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, opacity: deleting === code.id ? 0.5 : 1 }}
                            title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div style={S.overlay} onClick={() => setShowForm(false)}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>
                  {editing ? 'Edit Promo Code' : 'Create Promo Code'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>Code *</label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE10"
                      required
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Discount Type *</label>
                    <select
                      value={form.discount_type}
                      onChange={e => setForm({ ...form, discount_type: e.target.value })}
                      style={S.input}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>Discount Value *</label>
                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={e => setForm({ ...form, discount_value: e.target.value })}
                      placeholder={form.discount_type === 'percentage' ? '10' : '100'}
                      min="0"
                      step={form.discount_type === 'percentage' ? '1' : '0.01'}
                      required
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={form.min_order_amount}
                      onChange={e => setForm({ ...form, min_order_amount: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Applicable Category (Optional)</label>
                  <input
                    type="text"
                    value={form.applicable_category}
                    onChange={e => setForm({ ...form, applicable_category: e.target.value })}
                    placeholder="e.g., Xtreme Kolorz"
                    style={S.input}
                  />
                  <p style={{ fontSize: '0.6875rem', color: '#999999', marginTop: 4 }}>
                    Leave empty for all categories
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>Expiry Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={e => setForm({ ...form, expires_at: e.target.value })}
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Max Uses (Optional)</label>
                    <input
                      type="number"
                      value={form.max_uses || ''}
                      onChange={e => setForm({ ...form, max_uses: e.target.value })}
                      placeholder="Unlimited"
                      min="1"
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Description (Optional)</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g., Summer sale discount"
                    rows={2}
                    style={{ ...S.input, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={form.is_one_time}
                      onChange={e => setForm({ ...form, is_one_time: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>One-time use per customer</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{ flex: 1, padding: '10px', background: '#F5F5F5', border: 'none', borderRadius: 8, color: '#666666', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ flex: 1, padding: '10px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {saving ? 'Saving...' : <><Save size={14} /> Save Promo Code</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </KKAdminLayout>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
