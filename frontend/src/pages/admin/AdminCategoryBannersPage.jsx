import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Plus, Edit2, Trash2, Save, X, Upload, Eye, EyeOff, Image as ImageIcon, Monitor, Smartphone
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { categoriesAPI } from '../../services/apiClient'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const emptyBanner = () => ({
  category_id: '',
  desktop_image_url: '',
  mobile_image_url: '',
  heading: '',
  subheading: '',
  cta_text: '',
  cta_link: '',
  is_active: true,
  sort_order: 0,
})

export default function AdminCategoryBannersPage() {
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyBanner())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [uploadingField, setUploadingField] = useState(null)
  const [previewBanner, setPreviewBanner] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const catRes = await categoriesAPI.getAll({ active_only: 'false' })
      const cats = catRes.data || []
      setCategories(cats)

      const bannerResults = await Promise.all(
        cats.map(c =>
          categoriesAPI.getBanners(c.id)
            .then(r => (r.data || []).map(b => ({ ...b, _cat: c })))
            .catch(() => [])
        )
      )
      setBanners(bannerResults.flat())
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filteredBanners = filterCat
    ? banners.filter(b => b.category_id === filterCat)
    : banners

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyBanner(), category_id: categories[0]?.id || '' })
    setShowForm(true)
  }

  const openEdit = (banner) => {
    setEditing(banner)
    setForm({
      category_id: banner.category_id,
      desktop_image_url: banner.desktop_image_url || '',
      mobile_image_url: banner.mobile_image_url || '',
      heading: banner.heading || '',
      subheading: banner.subheading || '',
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      is_active: banner.is_active !== false,
      sort_order: banner.sort_order ?? 0,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.category_id) return toast.error('Select a category')
    if (!form.desktop_image_url && !form.heading) return toast.error('Provide at least a desktop image or heading')
    setSaving(true)
    try {
      const payload = {
        desktop_image_url: form.desktop_image_url || null,
        mobile_image_url: form.mobile_image_url || null,
        heading: form.heading || null,
        subheading: form.subheading || null,
        cta_text: form.cta_text || null,
        cta_link: form.cta_link || null,
        is_active: form.is_active !== false,
        sort_order: parseInt(form.sort_order) || 0,
      }
      if (editing?.id) {
        await categoriesAPI.updateBanner(form.category_id, editing.id, payload)
        toast.success('Banner updated!')
      } else {
        await categoriesAPI.createBanner(form.category_id, payload)
        toast.success('Banner created!')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (banner) => {
    if (!window.confirm('Delete this banner?')) return
    setDeleting(banner.id)
    try {
      await categoriesAPI.deleteBanner(banner.category_id, banner.id)
      toast.success('Banner deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (banner) => {
    try {
      await categoriesAPI.updateBanner(banner.category_id, banner.id, { is_active: !banner.is_active })
      setBanners(list => list.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      toast.success(banner.is_active ? 'Banner hidden' : 'Banner activated')
    } catch {
      toast.error('Failed to update')
    }
  }

  const uploadImage = async (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Only image files allowed')
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be < 10MB')
    setUploadingField(field)
    try {
      const ext = file.name.split('.').pop()
      const path = `banners/cat-${field}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm(f => ({ ...f, [`${field}_image_url`]: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingField(null)
    }
  }

  const S = {
    card: { background: '#FFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000', background: '#FFF', outline: 'none', boxSizing: 'border-box' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' },
    modal: { background: '#FFF', borderRadius: 14, width: '100%', maxWidth: 640, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginTop: 20, marginBottom: 20 },
  }

  return (
    <>
      <Helmet><title>Category Banners | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000', margin: 0 }}>Category Banners</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Manage hero banners for Kustom Kolors, Kustom Wrap, Accessories and any other main category.
            </p>
          </div>
          <button onClick={openAdd}
            style={{ padding: '8px 18px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
            <Plus size={14} /> Add Banner
          </button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: 16 }}>
          <select style={{ ...S.input, width: 'auto', minWidth: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
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
                  {['Banner', 'Category', 'Heading', 'CTA', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map(banner => (
                  <tr key={banner.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      {banner.desktop_image_url ? (
                        <img src={banner.desktop_image_url} alt="" onClick={() => setPreviewBanner(banner)}
                          style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #E5E5E5', cursor: 'pointer' }} />
                      ) : (
                        <div style={{ width: 80, height: 48, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={18} style={{ color: '#CCC' }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#000', fontFamily: "'Inter', sans-serif" }}>
                      {banner._cat?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555', fontFamily: "'Inter', sans-serif", maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.heading || '—'}</div>
                      {banner.subheading && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.subheading}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555', fontFamily: "'Inter', sans-serif" }}>{banner.cta_text || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: banner.is_active ? '#F0FDF4' : '#F5F5F5', color: banner.is_active ? '#16A34A' : '#888', fontFamily: "'Inter', sans-serif" }}>
                        {banner.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setPreviewBanner(banner)} title="Preview"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 6 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#7C3AED'; e.currentTarget.style.background = '#F5F3FF' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleToggleActive(banner)} title={banner.is_active ? 'Hide' : 'Activate'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 6 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          {banner.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => openEdit(banner)} title="Edit"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 6 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#CA2A31'; e.currentTarget.style.background = '#FFF0F0' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(banner)} disabled={deleting === banner.id} title="Delete"
                          style={{ background: 'none', border: 'none', cursor: deleting === banner.id ? 'not-allowed' : 'pointer', color: '#888', padding: 6, borderRadius: 6, opacity: deleting === banner.id ? 0.5 : 1 }}
                          onMouseEnter={e => { if (deleting !== banner.id) { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2' } }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBanners.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#AAA', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
                    No banners yet. Click "Add Banner" to create one.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div style={S.modal}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #F0F0F0' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000', margin: 0 }}>
                  {editing ? 'Edit Category Banner' : 'Add Category Banner'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto' }}>
                  <div>
                    <label style={S.label}>Category *</label>
                    <select style={S.input} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required disabled={!!editing}>
                      <option value="">— Select Category —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Desktop Image */}
                  <div>
                    <label style={S.label}><Monitor size={12} style={{ display: 'inline', marginRight: 4 }} />Desktop Banner Image</label>
                    {form.desktop_image_url && (
                      <div style={{ marginBottom: 8, position: 'relative' }}>
                        <img src={form.desktop_image_url} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E5E5' }} />
                        <button type="button" onClick={() => setForm(f => ({ ...f, desktop_image_url: '' }))}
                          style={{ position: 'absolute', top: 6, right: 6, background: '#EF4444', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px dashed #CCC', borderRadius: 7, background: '#FAFAFA', cursor: uploadingField === 'desktop' ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>
                      <Upload size={16} />
                      {uploadingField === 'desktop' ? 'Uploading…' : 'Upload Desktop Image'}
                      <input type="file" accept="image/*" onChange={e => uploadImage(e, 'desktop')} disabled={uploadingField === 'desktop'} style={{ display: 'none' }} />
                    </label>
                    <input style={{ ...S.input, marginTop: 6, fontSize: '0.75rem' }} value={form.desktop_image_url} onChange={e => setForm(f => ({ ...f, desktop_image_url: e.target.value }))} placeholder="Or paste image URL" />
                  </div>

                  {/* Mobile Image */}
                  <div>
                    <label style={S.label}><Smartphone size={12} style={{ display: 'inline', marginRight: 4 }} />Mobile Banner Image (Optional)</label>
                    {form.mobile_image_url && (
                      <div style={{ marginBottom: 8, position: 'relative', width: 120 }}>
                        <img src={form.mobile_image_url} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E5E5' }} />
                        <button type="button" onClick={() => setForm(f => ({ ...f, mobile_image_url: '' }))}
                          style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF' }}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px dashed #CCC', borderRadius: 7, background: '#FAFAFA', cursor: uploadingField === 'mobile' ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>
                      <Upload size={16} />
                      {uploadingField === 'mobile' ? 'Uploading…' : 'Upload Mobile Image'}
                      <input type="file" accept="image/*" onChange={e => uploadImage(e, 'mobile')} disabled={uploadingField === 'mobile'} style={{ display: 'none' }} />
                    </label>
                    <input style={{ ...S.input, marginTop: 6, fontSize: '0.75rem' }} value={form.mobile_image_url} onChange={e => setForm(f => ({ ...f, mobile_image_url: e.target.value }))} placeholder="Or paste mobile image URL" />
                  </div>

                  <div>
                    <label style={S.label}>Banner Heading</label>
                    <input style={S.input} value={form.heading} onChange={e => setForm(f => ({ ...f, heading: e.target.value }))} placeholder="e.g. Kustom Kolors Collection" />
                  </div>
                  <div>
                    <label style={S.label}>Banner Subtitle</label>
                    <input style={S.input} value={form.subheading} onChange={e => setForm(f => ({ ...f, subheading: e.target.value }))} placeholder="e.g. Premium pearl pigments for every finish" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={S.label}>CTA Button Text</label>
                      <input style={S.input} value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="e.g. Shop Now" />
                    </div>
                    <div>
                      <label style={S.label}>CTA Button Link</label>
                      <input style={S.input} value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="e.g. /products" />
                    </div>
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
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', border: '1px solid #E0E0E0', borderRadius: 7, background: '#FFF', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#666' }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: saving ? '#FFAAAA' : '#CA2A31', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#FFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                    {saving ? 'Saving…' : <><Save size={13} /> {editing ? 'Save Changes' : 'Create Banner'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewBanner && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setPreviewBanner(null)}>
            <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden', maxWidth: 900, width: '100%', position: 'relative' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewBanner(null)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFF', zIndex: 10 }}>
                <X size={16} />
              </button>
              <div style={{ position: 'relative', aspectRatio: '16/5', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewBanner.desktop_image_url && (
                  <img src={previewBanner.desktop_image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
                  {previewBanner.heading && (
                    <h2 style={{ color: '#FFF', fontFamily: "'Rajdhani', sans-serif", fontSize: '2rem', fontWeight: 700, margin: '0 0 8px' }}>{previewBanner.heading}</h2>
                  )}
                  {previewBanner.subheading && (
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif", fontSize: '1rem', margin: '0 0 16px' }}>{previewBanner.subheading}</p>
                  )}
                  {previewBanner.cta_text && (
                    <span style={{ display: 'inline-block', padding: '10px 24px', background: '#CA2A31', color: '#FFF', borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600 }}>
                      {previewBanner.cta_text}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid #222' }}>
                <p style={{ color: '#888', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                  Preview for: <strong style={{ color: '#FFF' }}>{previewBanner._cat?.name}</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </KKAdminLayout>
    </>
  )
}
