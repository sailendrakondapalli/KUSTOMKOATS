import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const DEFAULT_CATEGORIES = ['Xtreme Kolorz', 'Xtreme Wrap', 'Accessories', 'Wholesale']

const emptyForm = () => ({ name: '', slug: '', description: '', image_url: '', sort_order: 0, is_active: true })

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // category row
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      // categories table may not exist yet — seed defaults locally
      console.warn('categories table not ready:', error.message)
      setCategories(DEFAULT_CATEGORIES.map((name, i) => ({
        id: name, name, slug: name.toLowerCase().replace(/\s+/g, '-'), sort_order: i, is_active: true, _local: true,
      })))
    } else {
      if (data?.length) {
        setCategories(data)
      } else {
        // Seed defaults into Supabase
        const inserts = DEFAULT_CATEGORIES.map((name, i) => ({
          name, slug: name.toLowerCase().replace(/\s+/g, '-'), sort_order: i, is_active: true,
        }))
        await supabase.from('categories').insert(inserts)
        const { data: fresh } = await supabase.from('categories').select('*').order('sort_order')
        setCategories(fresh || [])
      }
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setShowForm(true) }
  const openEdit = (cat) => { setEditing(cat); setForm({ ...cat }); setShowForm(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Category name is required')
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description || null,
        image_url: form.image_url || null,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active !== false,
      }

      if (editing?.id && !editing._local) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Category updated!')
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
        toast.success('Category created!')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?\n\nThis will NOT delete products — they will just have no matching category.`)) return
    if (cat._local) { setCategories(c => c.filter(x => x.id !== cat.id)); return }
    setDeleting(cat.id)
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) toast.error(error.message)
    else { toast.success('Category deleted'); load() }
    setDeleting(null)
  }

  const S = {
    card: { background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    modal: { background: '#FFFFFF', borderRadius: 14, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  }

  return (
    <>
      <Helmet><title>Categories | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Categories</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Manage product categories. Changes reflect immediately on the website.
            </p>
          </div>
          <button onClick={openAdd}
            style={{ padding: '8px 18px', background: '#FF0000', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
            <Plus size={14} /> Add Category
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #FF0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={S.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                  {['Category', 'Slug', 'Sort Order', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {cat.image_url ? (
                          <img src={cat.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #E5E5E5', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Tag size={16} style={{ color: '#CCCCCC' }} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif" }}>{cat.name}</span>
                        {DEFAULT_CATEGORIES.includes(cat.name) && (
                          <span style={{ fontSize: '0.625rem', color: '#888888', background: '#F5F5F5', padding: '1px 6px', borderRadius: 999, fontFamily: "'Inter', sans-serif" }}>default</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif" }}>{cat.slug || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555555', fontFamily: "'Inter', sans-serif" }}>{cat.sort_order ?? 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: cat.is_active ? '#F0FDF4' : '#F5F5F5', color: cat.is_active ? '#16A34A' : '#888888', fontFamily: "'Inter', sans-serif" }}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => openEdit(cat)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: 6, borderRadius: 6, marginRight: 4 }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#FF0000'; e.currentTarget.style.background = '#FFF0F0' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#888888'; e.currentTarget.style.background = 'transparent' }}>
                        <Edit2 size={15} />
                      </button>
                      {!DEFAULT_CATEGORIES.includes(cat.name) && (
                        <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888888', padding: 6, borderRadius: 6 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888888'; e.currentTarget.style.background = 'transparent' }}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#AAAAAA', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
                    No categories yet. Add one above.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div style={S.modal}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F0F0F0' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>
                  {editing ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={S.label}>Category Name *</label>
                    <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Clearcoats" required />
                  </div>
                  <div>
                    <label style={S.label}>URL Slug</label>
                    <input style={S.input} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. clearcoats (auto-generated if empty)" />
                  </div>
                  <div>
                    <label style={S.label}>Description</label>
                    <textarea style={{ ...S.input, height: 72, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description (optional)" />
                  </div>
                  <div>
                    <label style={S.label}>Image URL</label>
                    <input style={S.input} value={form.image_url || ''} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://... (optional)" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={S.label}>Sort Order</label>
                      <input style={S.input} type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                    </div>
                    <div>
                      <label style={S.label}>Status</label>
                      <select style={S.input} value={form.is_active ? 'active' : 'hidden'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
                        <option value="active">Active</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 22px', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', border: '1px solid #E0E0E0', borderRadius: 7, background: '#FFFFFF', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#666666' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: saving ? '#FFAAAA' : '#FF0000', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                    {saving ? 'Saving...' : <><Save size={13} /> {editing ? 'Save Changes' : 'Create'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </KKAdminLayout>
    </>
  )
}
