import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const SECTIONS = [
  { key: 'product_categories', label: 'Product Categories' },
  { key: 'quick_links', label: 'Quick Links' },
]

const emptyForm = (section) => ({
  section,
  label: '',
  url: '',
  sort_order: 0,
  is_active: true
})

export default function AdminFooterLinksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm('quick_links'))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true })

      if (error) throw error
      setLinks(data || [])
    } catch (err) {
      toast.error('Failed to load footer links')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = (section) => { setEditing(null); setForm(emptyForm(section)); setShowForm(true) }
  const openEdit = (link) => { setEditing(link); setForm(link); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.label.trim()) return toast.error('Label is required')
    if (!form.url.trim()) return toast.error('URL is required')

    setSaving(true)
    try {
      const payload = {
        section: form.section,
        label: form.label.trim(),
        url: form.url.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active
      }

      if (editing?.id) {
        const { error } = await supabase.from('footer_links').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Link updated!')
      } else {
        const { error } = await supabase.from('footer_links').insert(payload)
        if (error) throw error
        toast.success('Link created!')
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

  const handleDelete = async (link) => {
    if (!window.confirm(`Delete this link: "${link.label}"?`)) return
    setDeleting(link.id)
    try {
      const { error } = await supabase.from('footer_links').delete().eq('id', link.id)
      if (error) throw error
      toast.success('Link deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
      console.error(err)
    }
    setDeleting(null)
  }

  const handleToggleActive = async (link) => {
    try {
      const { error } = await supabase.from('footer_links').update({ is_active: !link.is_active }).eq('id', link.id)
      if (error) throw error
      toast.success(link.is_active ? 'Link hidden' : 'Link shown')
      load()
    } catch (err) {
      toast.error('Failed to update status')
      console.error(err)
    }
  }

  const handleReorder = async (link, direction) => {
    const sameSection = links.filter(l => l.section === link.section)
    const currentIndex = sameSection.findIndex(l => l.id === link.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === sameSection.length - 1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const other = sameSection[newIndex]

    try {
      const { error: error1 } = await supabase.from('footer_links').update({ sort_order: other.sort_order }).eq('id', link.id)
      const { error: error2 } = await supabase.from('footer_links').update({ sort_order: link.sort_order }).eq('id', other.id)
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
    modal: { background: '#FFFFFF', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflow: 'auto' },
  }

  return (
    <>
      <Helmet><title>Footer Links | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Footer Links</h1>
          <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
            Manage the "Product Categories" and "Quick Links" columns shown in the site footer
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SECTIONS.map(({ key, label }) => {
              const items = links.filter(l => l.section === key)
              return (
                <div key={key} style={S.card}>
                  <div style={{ padding: '12px 16px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                      {label}
                    </span>
                    <button onClick={() => openAdd(key)}
                      style={{ padding: '6px 12px', background: '#CA2A31', border: 'none', borderRadius: 7, color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
                      <Plus size={13} /> Add Link
                    </button>
                  </div>
                  {items.length === 0 ? (
                    <p style={{ padding: 24, textAlign: 'center', color: '#999999', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                      No links yet in this section.
                    </p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {items.map((link, index) => (
                          <tr key={link.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '12px 16px' }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000000', margin: 0 }}>{link.label}</p>
                              <p style={{ fontSize: '0.75rem', color: '#999999', margin: '2px 0 0', fontFamily: "'Inter', sans-serif" }}>{link.url}</p>
                            </td>
                            <td style={{ padding: '12px 16px', width: 100 }}>
                              <button
                                onClick={() => handleToggleActive(link)}
                                style={{
                                  border: 'none',
                                  background: link.is_active ? '#DCFCE7' : '#F3F4F6',
                                  color: link.is_active ? '#16A34A' : '#6B7280',
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
                                {link.is_active ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
                              </button>
                            </td>
                            <td style={{ padding: '12px 16px', width: 60 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <button onClick={() => handleReorder(link, 'up')} disabled={index === 0}
                                  style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#D1D5DB' : '#666666', padding: 2 }}
                                  title="Move up">
                                  <ChevronUp size={16} />
                                </button>
                                <button onClick={() => handleReorder(link, 'down')} disabled={index === items.length - 1}
                                  style={{ background: 'none', border: 'none', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', color: index === items.length - 1 ? '#D1D5DB' : '#666666', padding: 2 }}
                                  title="Move down">
                                  <ChevronDown size={16} />
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', width: 80 }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => openEdit(link)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666', padding: 4 }}
                                  title="Edit">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(link)}
                                  disabled={deleting === link.id}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, opacity: deleting === link.id ? 0.5 : 1 }}
                                  title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div style={S.overlay} onClick={() => setShowForm(false)}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>
                  {editing ? 'Edit Link' : 'Create Link'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Section *</label>
                  <select
                    value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                    style={S.input}
                  >
                    {SECTIONS.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Label *</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g., Shipping Policy"
                    required
                    style={S.input}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>URL *</label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="e.g., /shipping-policy or https://example.com"
                    required
                    style={S.input}
                  />
                  <p style={{ fontSize: '0.6875rem', color: '#999999', marginTop: 4 }}>
                    Use a relative path (e.g., /faq) for internal pages, or a full URL for external links
                  </p>
                </div>

                <div style={{ marginBottom: 16 }}>
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
                    Lower numbers appear first within the section
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Visible in footer</span>
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
                    {saving ? 'Saving...' : <><Save size={14} /> Save Link</>}
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
