import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Plus, Edit2, Trash2, Save, X, Star, ThumbsUp, ThumbsDown, Eye, EyeOff, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const emptyForm = () => ({
  name: '',
  review: '',
  rating: 5,
  role: '',
  image_url: '',
  is_approved: true,
  is_active: true,
  display_order: 0
})

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
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
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTestimonials(data || [])
    } catch (err) {
      toast.error('Failed to load testimonials')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setShowForm(true) }
  const openEdit = (testimonial) => {
    setEditing(testimonial)
    setForm(testimonial)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.review.trim()) return toast.error('Review is required')
    if (form.rating < 1 || form.rating > 5) return toast.error('Rating must be between 1 and 5')

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        review: form.review.trim(),
        rating: parseInt(form.rating),
        role: form.role.trim() || null,
        image_url: form.image_url.trim() || null,
        is_approved: form.is_approved,
        is_active: form.is_active,
        display_order: parseInt(form.display_order) || 0
      }

      if (editing?.id) {
        const { error } = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', editing.id)
        
        if (error) throw error
        toast.success('Testimonial updated!')
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(payload)
        
        if (error) throw error
        toast.success('Testimonial created!')
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

  const handleDelete = async (testimonial) => {
    if (!window.confirm(`Delete testimonial from "${testimonial.name}"?`)) return
    setDeleting(testimonial.id)
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonial.id)
      
      if (error) throw error
      toast.success('Testimonial deleted')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
      console.error(err)
    }
    setDeleting(null)
  }

  const handleToggleApproved = async (testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: !testimonial.is_approved })
        .eq('id', testimonial.id)
      
      if (error) throw error
      toast.success(testimonial.is_approved ? 'Testimonial unapproved' : 'Testimonial approved')
      load()
    } catch (err) {
      toast.error('Failed to update status')
      console.error(err)
    }
  }

  const handleToggleActive = async (testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !testimonial.is_active })
        .eq('id', testimonial.id)
      
      if (error) throw error
      toast.success(testimonial.is_active ? 'Testimonial hidden' : 'Testimonial shown')
      load()
    } catch (err) {
      toast.error('Failed to update status')
      console.error(err)
    }
  }

  const handleReorder = async (testimonial, direction) => {
    const currentIndex = testimonials.findIndex(t => t.id === testimonial.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === testimonials.length - 1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const otherTestimonial = testimonials[newIndex]

    try {
      const { error: error1 } = await supabase
        .from('testimonials')
        .update({ display_order: otherTestimonial.display_order })
        .eq('id', testimonial.id)
      
      const { error: error2 } = await supabase
        .from('testimonials')
        .update({ display_order: testimonial.display_order })
        .eq('id', otherTestimonial.id)
      
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

  return (
    <>
      <Helmet><title>Testimonials | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Testimonials</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Manage customer reviews and testimonials
            </p>
          </div>
          <button onClick={openAdd}
            style={{ padding: '8px 18px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
            <Plus size={14} /> Add Testimonial
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
                  {['Customer', 'Review', 'Rating', 'Approved', 'Visible', 'Order', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#999999', fontSize: '0.875rem' }}>
                      No testimonials yet. Click "Add Testimonial" to create one.
                    </td>
                  </tr>
                ) : (
                  testimonials.map((testimonial, index) => (
                    <tr key={testimonial.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img 
                            src={testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=CA2A31&color=fff`}
                            alt={testimonial.name}
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=CA2A31&color=fff`
                            }}
                          />
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000000', margin: 0 }}>{testimonial.name}</p>
                            {testimonial.role && <p style={{ fontSize: '0.75rem', color: '#666666', margin: 0 }}>{testimonial.role}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                        <p style={{ fontSize: '0.875rem', color: '#666666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {testimonial.review}
                        </p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < testimonial.rating ? '#FBBF24' : 'none'}
                              stroke={i < testimonial.rating ? '#FBBF24' : '#E5E7EB'}
                            />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleApproved(testimonial)}
                          style={{
                            border: 'none',
                            background: testimonial.is_approved ? '#DCFCE7' : '#FEE2E2',
                            color: testimonial.is_approved ? '#16A34A' : '#DC2626',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {testimonial.is_approved ? <><ThumbsUp size={12} /> Yes</> : <><ThumbsDown size={12} /> No</>}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleActive(testimonial)}
                          style={{
                            border: 'none',
                            background: testimonial.is_active ? '#DBEAFE' : '#F3F4F6',
                            color: testimonial.is_active ? '#1E40AF' : '#6B7280',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {testimonial.is_active ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Hidden</>}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <button
                            onClick={() => handleReorder(testimonial, 'up')}
                            disabled={index === 0}
                            style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#D1D5DB' : '#666666', padding: 2 }}
                            title="Move up"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => handleReorder(testimonial, 'down')}
                            disabled={index === testimonials.length - 1}
                            style={{ background: 'none', border: 'none', cursor: index === testimonials.length - 1 ? 'not-allowed' : 'pointer', color: index === testimonials.length - 1 ? '#D1D5DB' : '#666666', padding: 2 }}
                            title="Move down"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(testimonial)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666', padding: 4 }}
                            title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(testimonial)}
                            disabled={deleting === testimonial.id}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, opacity: deleting === testimonial.id ? 0.5 : 1 }}
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
                  {editing ? 'Edit Testimonial' : 'Create Testimonial'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>Customer Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      style={S.input}
                    />
                  </div>

                  <div>
                    <label style={S.label}>Role / Title</label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g., Verified Buyer"
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Review Text *</label>
                  <textarea
                    value={form.review}
                    onChange={e => setForm({ ...form, review: e.target.value })}
                    placeholder="Share your experience..."
                    rows={4}
                    required
                    style={{ ...S.input, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>Rating *</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="number"
                        value={form.rating}
                        onChange={e => setForm({ ...form, rating: Math.min(5, Math.max(1, e.target.value)) })}
                        min="1"
                        max="5"
                        required
                        style={{ ...S.input, width: 80 }}
                      />
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={18} 
                            fill={i < form.rating ? '#FBBF24' : 'none'}
                            stroke={i < form.rating ? '#FBBF24' : '#E5E7EB'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={S.label}>Display Order</label>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={e => setForm({ ...form, display_order: e.target.value })}
                      placeholder="0"
                      min="0"
                      style={S.input}
                    />
                    <p style={{ fontSize: '0.6875rem', color: '#999999', marginTop: 4 }}>
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Image URL</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    style={S.input}
                  />
                  <p style={{ fontSize: '0.6875rem', color: '#999999', marginTop: 4 }}>
                    Optional. Leave empty to use generated avatar
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={form.is_approved}
                      onChange={e => setForm({ ...form, is_approved: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Approved</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Visible</span>
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
                    {saving ? 'Saving...' : <><Save size={14} /> Save Testimonial</>}
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
