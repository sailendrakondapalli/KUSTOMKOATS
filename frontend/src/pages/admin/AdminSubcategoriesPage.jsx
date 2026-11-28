import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, Eye, EyeOff, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { subcategoriesAPI, categoriesAPI } from '../../services/apiClient'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const emptyForm = () => ({
  category_id: '',
  name: '',
  slug: '',
  description: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
  seo_title: '',
  seo_description: '',
})

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [subRes, catRes] = await Promise.all([
        subcategoriesAPI.getAll({ active_only: 'false' }),
        categoriesAPI.getAll({ active_only: 'false' }),
      ])
      setSubcategories(subRes.data || [])
      setCategories(catRes.data || [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm(), category_id: categories[0]?.id || '' })
    setShowForm(true)
  }

  const openEdit = (sub) => {
    setEditing(sub)
    setForm({
      category_id: sub.category?.id || sub.category_id || '',
      name: sub.name || '',
      slug: sub.slug || '',
      description: sub.description || '',
      image_url: sub.image_url || '',
      sort_order: sub.sort_order ?? 0,
      is_active: sub.is_active !== false,
      seo_title: sub.seo_title || '',
      seo_description: sub.seo_description || '',
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Subcategory name is required')
    if (!form.category_id) return toast.error('Select a parent category')
    setSaving(true)
    try {
      const payload = {
        category_id: form.category_id,
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: form.description || null,
        image_url: form.image_url || null,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active !== false,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
      }
      if (editing?.id) {
        await subcategoriesAPI.update(editing.id, payload)
        toast.success('Subcategory updated!')
      } else {
        await subcategoriesAPI.create(payload)
        toast.success('Subcategory created!')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (sub) => {
    if (!window.confirm(`Delete subcategory "${sub.name}"?\nThis cannot be undone if products are assigned.`)) return
    setDeleting(sub.id)
    try {
      await subcategoriesAPI.delete(sub.id)
      toast.success('Subcategory deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (sub) => {
    try {
      await subcategoriesAPI.update(sub.id, { is_active: !sub.is_active })
      setSubcategories(list => list.map(s => s.id === sub.id ? { ...s, is_active: !s.is_active } : s))
      toast.success(sub.is_active ? 'Hidden' : 'Activated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Only image files allowed')
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be < 5MB')
    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `subcategories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm(f => ({ ...f, image_url: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const filtered = subcategories.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || (s.category?.id || s.category_id) === filterCat
    return matchSearch && matchCat
  })

  const S = {
    card: { background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' },
    modal: { background: '#FFFFFF', borderRadius: 14, width: '100%', maxWidth: 580, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginTop: 20, marginBottom: 20 },
  }

  return (
    <>
      <Helmet><title>Subcategories | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000', margin: 0 }}>Subcategories</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Manage subcategories. Each can have its own hero banner.
            </p>
          </div>
          <button onClick={openAdd}
            style={{ padding: '8px 18px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
            <Plus size={14} /> Add Subcategory
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input style={{ ...S.input, paddingLeft: 32 }} placeholder="Search subcategories…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ ...S.input, width: 'auto', minWidth: 160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
                  {['Subcategory', 'Parent Category', 'Slug', 'Order', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {sub.image_url ? (
                          <img src={sub.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid #E5E5E5', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ImageIcon size={16} style={{ color: '#CCC' }} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000', fontFamily: "'Inter', sans-serif" }}>{sub.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>
                      {sub.category?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#888', fontFamily: "'Inter', sans-serif" }}>{sub.slug}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555', fontFamily: "'Inter', sans-serif" }}>{sub.sort_order ?? 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: sub.is_active ? '#F0FDF4' : '#F5F5F5', color: sub.is_active ? '#16A34A' : '#888', fontFamily: "'Inter', sans-serif" }}>
                        {sub.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button onClick={() => handleToggleActive(sub)} title={sub.is_active ? 'Deactivate' : 'Activate'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 6 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          {sub.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => openEdit(sub)} title="Edit"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 6 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#CA2A31'; e.currentTarget.style.background = '#FFF0F0' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(sub)} disabled={deleting === sub.id} title="Delete"
                          style={{ background: 'none', border: 'none', cursor: deleting === sub.id ? 'not-allowed' : 'pointer', color: '#888', padding: 6, borderRadius: 6, opacity: deleting === sub.id ? 0.5 : 1 }}
                          onMouseEnter={e => { if (deleting !== sub.id) { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2' } }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#AAA', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
                    {search || filterCat ? 'No subcategories match your filters.' : 'No subcategories yet. Add one above.'}
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
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000', margin: 0 }}>
                  {editing ? 'Edit Subcategory' : 'Add Subcategory'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={S.label}>Parent Category *</label>
                    <select style={S.input} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required>
                      <option value="">— Select Category —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Subcategory Name *</label>
                    <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kustom Signatures" required />
                  </div>
                  <div>
                    <label style={S.label}>URL Slug</label>
                    <input style={S.input} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated from name" />
                  </div>
                  <div>
                    <label style={S.label}>Description</label>
                    <textarea style={{ ...S.input, height: 68, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
                  </div>
                  <div>
                    <label style={S.label}>Image</label>
                    {form.image_url && (
                      <div style={{ marginBottom: 8, position: 'relative', width: 'fit-content' }}>
                        <img src={form.image_url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E5E5' }} />
                        <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                          style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px dashed #CCC', borderRadius: 7, background: '#FAFAFA', cursor: uploadingImage ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>
                      <Upload size={16} />
                      {uploadingImage ? 'Uploading…' : form.image_url ? 'Change Image' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: 'none' }} />
                    </label>
                    <input style={{ ...S.input, marginTop: 8, fontSize: '0.75rem' }} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste image URL" />
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
                  <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 14 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>SEO (Optional)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label style={S.label}>SEO Title</label>
                        <input style={S.input} value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} placeholder="SEO page title" />
                      </div>
                      <div>
                        <label style={S.label}>SEO Description</label>
                        <textarea style={{ ...S.input, height: 56, resize: 'vertical' }} value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} placeholder="Meta description" />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 22px', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', border: '1px solid #E0E0E0', borderRadius: 7, background: '#FFF', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#666' }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: saving ? '#FFAAAA' : '#CA2A31', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#FFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                    {saving ? 'Saving…' : <><Save size={13} /> {editing ? 'Save Changes' : 'Create'}</>}
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
