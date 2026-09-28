import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const emptyForm = () => ({
  category: 'General',
  question: '',
  answer: '',
  sort_order: 0,
  is_published: true
})

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })

      if (error) throw error
      setFaqs(data || [])
    } catch (err) {
      toast.error('Failed to load FAQs')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setShowForm(true) }
  const openEdit = (faq) => { setEditing(faq); setForm(faq); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.question.trim()) return toast.error('Question is required')
    if (!form.answer.trim()) return toast.error('Answer is required')

    setSaving(true)
    try {
      const payload = {
        category: form.category.trim() || 'General',
        question: form.question.trim(),
        answer: form.answer.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        is_published: form.is_published
      }

      if (editing?.id) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('FAQ updated!')
      } else {
        const { error } = await supabase.from('faqs').insert(payload)
        if (error) throw error
        toast.success('FAQ created!')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (faq) => {
    if (!window.confirm(`Delete this FAQ: "${faq.question}"?`)) return
    setDeleting(faq.id)
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', faq.id)
      if (error) throw error
      toast.success('FAQ deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
      console.error(err)
    }
    setDeleting(null)
  }

  const handleTogglePublished = async (faq) => {
    try {
      const { error } = await supabase.from('faqs').update({ is_published: !faq.is_published }).eq('id', faq.id)
      if (error) throw error
      toast.success(faq.is_published ? 'FAQ hidden' : 'FAQ published')
      load()
    } catch (err) {
      toast.error('Failed to update status')
      console.error(err)
    }
  }

  const handleReorder = async (faq, direction) => {
    const sameCategory = faqs.filter(f => f.category === faq.category)
    const currentIndex = sameCategory.findIndex(f => f.id === faq.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === sameCategory.length - 1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const other = sameCategory[newIndex]

    try {
      const { error: error1 } = await supabase.from('faqs').update({ sort_order: other.sort_order }).eq('id', faq.id)
      const { error: error2 } = await supabase.from('faqs').update({ sort_order: faq.sort_order }).eq('id', other.id)
      if (error1 || error2) throw error1 || error2
      toast.success('Order updated')
      load()
    } catch (err) {
      toast.error('Failed to reorder')
      console.error(err)
    }
  }

  const S = {
    card: { background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modal: { background: '#FFFFFF', borderRadius: 14, width: '100%', maxWidth: 620, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflow: 'auto' },
  }

  // Group by category for reorder context & display
  const grouped = faqs.reduce((acc, f) => {
    acc[f.category] = acc[f.category] || []
    acc[f.category].push(f)
    return acc
  }, {})

  return (
    <>
      <Helmet><title>FAQs | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>FAQs</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Manage frequently asked questions shown on the /faq page
            </p>
          </div>
          <button onClick={openAdd}
            style={{ padding: '9px 18px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
            <Plus size={14} /> Add FAQ
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : faqs.length === 0 ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: '#999999', fontSize: '0.875rem' }}>
            No FAQs yet. Click "Add FAQ" to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} style={S.card}>
                <div style={{ padding: '12px 16px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                    {category}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {items.map((faq, index) => (
                      <tr key={faq.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px', maxWidth: 420 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000000', margin: 0 }}>{faq.question}</p>
                          <p style={{ fontSize: '0.8125rem', color: '#666666', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {faq.answer}
                          </p>
                        </td>
                        <td style={{ padding: '12px 16px', width: 110 }}>
                          <button
                            onClick={() => handleTogglePublished(faq)}
                            style={{
                              border: 'none',
                              background: faq.is_published ? '#DCFCE7' : '#F3F4F6',
                              color: faq.is_published ? '#16A34A' : '#6B7280',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'Inter', sans-serif",
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {faq.is_published ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px', width: 60 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <button onClick={() => handleReorder(faq, 'up')} disabled={index === 0}
                              style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#D1D5DB' : '#666666', padding: 2 }}
                              title="Move up">
                              <ChevronUp size={16} />
                            </button>
                            <button onClick={() => handleReorder(faq, 'down')} disabled={index === items.length - 1}
                              style={{ background: 'none', border: 'none', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', color: index === items.length - 1 ? '#D1D5DB' : '#666666', padding: 2 }}
                              title="Move down">
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', width: 80 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => openEdit(faq)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666', padding: 4 }}
                              title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(faq)}
                              disabled={deleting === faq.id}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, opacity: deleting === faq.id ? 0.5 : 1 }}
                              title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div style={S.overlay} onClick={() => setShowForm(false)}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>
                  {editing ? 'Edit FAQ' : 'Create FAQ'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>Category *</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., General, Orders, Wholesale"
                      required
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Sort Order</label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={e => setForm({ ...form, sort_order: e.target.value })}
                      placeholder="0"
                      min="0"
                      style={S.input}
                    />
                    <p style={{ fontSize: '0.6875rem', color: '#999999', marginTop: 4 }}>
                      Lower numbers appear first within the category
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Question *</label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={e => setForm({ ...form, question: e.target.value })}
                    placeholder="e.g., What products does Kustom Koats offer?"
                    required
                    style={S.input}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Answer *</label>
                  <textarea
                    value={form.answer}
                    onChange={e => setForm({ ...form, answer: e.target.value })}
                    placeholder="Write the answer..."
                    rows={4}
                    required
                    style={{ ...S.input, resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={e => setForm({ ...form, is_published: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Published (visible on site)</span>
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
                    {saving ? 'Saving...' : <><Save size={14} /> Save FAQ</>}
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
