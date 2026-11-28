import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MessageSquare, Send } from 'lucide-react'
import api from '../services/apiClient'

export default function EnquiryPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())    return toast.error('Name is required')
    if (!form.phone.trim())   return toast.error('Phone number is required')
    if (!form.email.trim())   return toast.error('Email is required')
    if (!form.message.trim()) return toast.error('Message is required')

    setSubmitting(true)
    try {
      await api.enquiry.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        enquiry_type: 'general',
        status: 'new',
      })

      toast.success('Enquiry submitted! We will contact you shortly.')
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      console.error('Enquiry error:', err)
      toast.error('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const S = {
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #E0E0E0',
      borderRadius: 8,
      fontSize: '0.9375rem',
      fontFamily: "'Inter', sans-serif",
      color: '#000',
      background: '#FFF',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s',
    },
    label: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#333',
      fontFamily: "'Inter', sans-serif",
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: 6,
    },
  }

  return (
    <>
      <Helmet>
        <title>Enquiry – Kustom Koats</title>
        <meta name="description" content="Send an enquiry to Kustom Koats. We'll get back to you shortly." />
      </Helmet>

      <div style={{ background: '#FFF', minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ background: '#000', padding: '80px 24px 60px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#CA2A31', marginBottom: 12, fontWeight: 600 }}>
            PRODUCT ENQUIRY
          </p>
          <h1 style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 700, color: '#FFF', lineHeight: 1.15, marginBottom: 16 }}>
            Send an Enquiry
          </h1>
          <p style={{ color: '#CCC', fontSize: '1rem', maxWidth: 480, margin: '0 auto', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
            Interested in our products? Send us your enquiry and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* Form */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 80px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontSize: '1.75rem' }}>✅</span>
              </div>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#000', margin: '0 0 12px' }}>Enquiry Received!</h2>
              <p style={{ color: '#666', fontFamily: "'Inter', sans-serif", fontSize: '1rem', margin: '0 0 28px', lineHeight: 1.6 }}>
                Thank you. Our team will contact you at the number or email you provided within 24 hours.
              </p>
              <button onClick={() => setSubmitted(false)}
                style={{ padding: '11px 28px', background: '#CA2A31', border: 'none', borderRadius: 8, color: '#FFF', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={S.label}>Full Name *</label>
                <input style={S.input} value={form.name} onChange={e => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  onFocus={e => e.target.style.borderColor = '#CA2A31'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E0'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="enquiry-grid">
                <div>
                  <label style={S.label}>Phone *</label>
                  <input type="tel" style={S.input} value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    onFocus={e => e.target.style.borderColor = '#CA2A31'}
                    onBlur={e => e.target.style.borderColor = '#E0E0E0'} />
                </div>
                <div>
                  <label style={S.label}>Email *</label>
                  <input type="email" style={S.input} value={form.email} onChange={e => handleChange('email', e.target.value)}
                    placeholder="your@email.com"
                    onFocus={e => e.target.style.borderColor = '#CA2A31'}
                    onBlur={e => e.target.style.borderColor = '#E0E0E0'} />
                </div>
              </div>

              <div>
                <label style={S.label}>Message *</label>
                <textarea rows={6} style={{ ...S.input, resize: 'vertical' }} value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="Describe what you're looking for — product name, quantity, application, etc."
                  onFocus={e => e.target.style.borderColor = '#CA2A31'}
                  onBlur={e => e.target.style.borderColor = '#E0E0E0'} />
              </div>

              <button type="submit" disabled={submitting}
                style={{
                  padding: '14px 32px',
                  background: submitting ? '#FFAAAA' : '#CA2A31',
                  border: 'none',
                  borderRadius: 8,
                  color: '#FFF',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#B02228' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#CA2A31' }}>
                {submitting ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Sending…
                  </>
                ) : (
                  <><Send size={16} /> Submit Enquiry</>
                )}
              </button>

              <p style={{ fontSize: '0.8125rem', color: '#AAA', fontFamily: "'Inter', sans-serif", textAlign: 'center', margin: 0 }}>
                You can also call us at <a href="tel:+919043700776" style={{ color: '#CA2A31', textDecoration: 'none' }}>+91 90437 00776</a> or email <a href="mailto:info@kustomkoats.in" style={{ color: '#CA2A31', textDecoration: 'none' }}>info@kustomkoats.in</a>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .enquiry-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  )
}
