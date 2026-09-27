import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Save, Plus, Trash2, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const PAGES = [
  { key: 'why-partner', label: 'Why Partner With Us', path: '/wholesale/why-partner' },
  { key: 'our-story', label: 'Our Story', path: '/about/story' },
  { key: 'our-philosophy', label: 'Our Philosophy', path: '/about/philosophy' },
]

const emptySection = () => ({ heading: '', body: '' })

export default function AdminPageContentEditor() {
  const [activeKey, setActiveKey] = useState(PAGES[0].key)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [sections, setSections] = useState([])

  const activePage = PAGES.find(p => p.key === activeKey)

  const load = async (key) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_pages_content')
        .select('*')
        .eq('page_key', key)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setHeroTitle(data.hero_title || '')
        setHeroSubtitle(data.hero_subtitle || '')
        setSections(Array.isArray(data.sections) ? data.sections : [])
      } else {
        setHeroTitle('')
        setHeroSubtitle('')
        setSections([])
      }
    } catch (err) {
      toast.error('Failed to load page content')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load(activeKey) }, [activeKey])

  const addSection = () => setSections(s => [...s, emptySection()])
  const removeSection = (idx) => setSections(s => s.filter((_, i) => i !== idx))
  const updateSection = (idx, field, value) =>
    setSections(s => s.map((sec, i) => (i === idx ? { ...sec, [field]: value } : sec)))
  const moveSection = (idx, direction) => {
    setSections(s => {
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= s.length) return s
      const copy = [...s]
      ;[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]]
      return copy
    })
  }

  const handleSave = async () => {
    if (!heroTitle.trim()) return toast.error('Hero title is required')

    setSaving(true)
    try {
      const payload = {
        page_key: activeKey,
        hero_title: heroTitle.trim(),
        hero_subtitle: heroSubtitle.trim(),
        sections: sections
          .map(s => ({ heading: s.heading.trim(), body: s.body.trim() }))
          .filter(s => s.heading || s.body),
      }

      const { error } = await supabase
        .from('site_pages_content')
        .upsert(payload, { onConflict: 'page_key' })

      if (error) throw error
      toast.success('Page content saved!')
    } catch (err) {
      toast.error(err.message || 'Failed to save')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const S = {
    card: { background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, padding: 24 },
    label: { fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", marginBottom: 5, display: 'block' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },
  }

  return (
    <>
      <Helmet><title>Page Content | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Page Content</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Edit content for Why Partner, Our Story, and Our Philosophy pages
            </p>
          </div>
          {activePage && (
            <a href={activePage.path} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#CA2A31', fontFamily: "'Inter', sans-serif", textDecoration: 'none', fontWeight: 600 }}>
              View page <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Page tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {PAGES.map(p => (
            <button
              key={p.key}
              onClick={() => setActiveKey(p.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                background: activeKey === p.key ? '#CA2A31' : '#F0F0F0',
                color: activeKey === p.key ? '#FFFFFF' : '#333333',
                transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hero */}
            <div style={S.card}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.0625rem', fontWeight: 700, color: '#000000', margin: '0 0 16px' }}>
                Hero Section
              </h2>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Hero Title *</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={e => setHeroTitle(e.target.value)}
                  placeholder="e.g. WHY PARTNER WITH US"
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Hero Subtitle</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={e => setHeroSubtitle(e.target.value)}
                  placeholder="Short supporting line shown under the title"
                  style={S.input}
                />
              </div>
            </div>

            {/* Content sections */}
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.0625rem', fontWeight: 700, color: '#000000', margin: 0 }}>
                  Content Sections
                </h2>
                <button onClick={addSection}
                  style={{ padding: '6px 14px', background: '#000000', border: 'none', borderRadius: 7, color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Inter', sans-serif" }}>
                  <Plus size={13} /> Add Section
                </button>
              </div>

              {sections.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: '#999999', fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: '24px 0' }}>
                  No sections yet. Click "Add Section" to start writing this page's content.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {sections.map((sec, idx) => (
                    <div key={idx} style={{ border: '1px solid #EEEEEE', borderRadius: 10, padding: 16, position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#999999', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                          Section {idx + 1}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0}
                            style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#D1D5DB' : '#666666', padding: 2 }}
                            title="Move up">
                            <ChevronUp size={16} />
                          </button>
                          <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1}
                            style={{ background: 'none', border: 'none', cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer', color: idx === sections.length - 1 ? '#D1D5DB' : '#666666', padding: 2 }}
                            title="Move down">
                            <ChevronDown size={16} />
                          </button>
                          <button onClick={() => removeSection(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2 }}
                            title="Remove section">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label style={S.label}>Heading</label>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={e => updateSection(idx, 'heading', e.target.value)}
                          placeholder="Section heading"
                          style={S.input}
                        />
                      </div>
                      <div>
                        <label style={S.label}>Body</label>
                        <textarea
                          value={sec.body}
                          onChange={e => updateSection(idx, 'body', e.target.value)}
                          placeholder="Section paragraph text..."
                          rows={4}
                          style={{ ...S.input, resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '10px 24px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {saving ? 'Saving...' : <><Save size={15} /> Save Changes</>}
              </button>
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
