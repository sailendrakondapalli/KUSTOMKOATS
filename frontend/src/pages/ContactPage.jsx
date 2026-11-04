import { useState } from 'react'
import { Mail, Phone, Clock, MapPin } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const WHATSAPP_NUMBER = "919043700776"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (name.trim().length < 3) e.name = "Name must be at least 3 characters"
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address"
    if (!phone.trim()) e.phone = "Phone number is required"
    if (!message.trim()) e.message = "Message is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('enquiries')
        .insert([{
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim(),
          message: message.trim(),
          enquiry_type: 'general',
          status: 'new'
        }])

      if (error) throw error

      toast.success('Message sent! We will get back to you soon.')

      const text = `Hi Kustom Koats!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")

      setName(""); setEmail(""); setPhone(""); setMessage("")
    } catch (err) {
      console.error('Error submitting contact form:', err)
      toast.error('Could not send message. Redirecting to WhatsApp.')
      const text = `Hi Kustom Koats!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: <Phone size={20} />,
      label: 'Phone / WhatsApp',
      value: '+91 90437 00776',
      href: 'tel:+919043700776',
    },
    {
      icon: <Mail size={20} />,
      label: 'Email',
      value: 'info@kustomkoats.com',
      href: 'mailto:info@kustomkoats.com',
    },
    {
      icon: <Clock size={20} />,
      label: 'Business Hours',
      value: 'Mon – Sat, 9:00 AM – 6:00 PM',
      href: null,
    },
    {
      icon: <MapPin size={20} />,
      label: 'Location',
      value: 'India',
      href: null,
    },
  ]

  const inputClass = `
    w-full rounded-lg px-4 py-3 text-sm
    placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#CA2A31] transition-all
  `
  const inputStyle = {
    background: "#FFFFFF",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    color: "#000000",
    fontFamily: "'Inter', sans-serif",
  }

  return (
    <>
      <Helmet>
        <title>Contact Us – Kustom Koats Automotive Pearls</title>
        <meta name="description" content="Contact Kustom Koats for premium automotive pearls. Call us at +91 90437 00776 or send us a message." />
      </Helmet>

      {/* Page wrapper */}
      <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>

        {/* Hero banner */}
        <div style={{
          background: "#000000",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#CA2A31",
            marginBottom: "12px",
            fontWeight: 600
          }}>
            GET IN TOUCH
          </p>
          <h1 style={{
            fontFamily: "'Rajdhani', 'Inter', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.15,
            marginBottom: "16px",
            letterSpacing: "0.02em"
          }}>
            Contact Us
          </h1>
          <p style={{
            color: "#CCCCCC",
            fontSize: "1rem",
            maxWidth: "480px",
            margin: "0 auto",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.6,
          }}>
            Have questions about our automotive pearls? We're here to help with product selection, technical support, and orders.
          </p>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px 80px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }} className="contact-grid">

            {/* LEFT — Info cards */}
            <div>
              <h2 style={{
                fontFamily: "'Rajdhani', 'Inter', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#000000",
                marginBottom: "24px",
                letterSpacing: "0.02em",
              }}>
                Our Details
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {contactInfo.map((item, i) => (
                  <div key={i} style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                  }}>
                    <div style={{ color: "#CA2A31", flexShrink: 0, marginTop: "2px" }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{
                        color: "#666666",
                        fontSize: "0.6875rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {item.label}
                      </p>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith('http') ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          style={{
                            color: "#000000",
                            fontSize: "0.9375rem",
                            fontFamily: "'Inter', sans-serif",
                            textDecoration: "none",
                            lineHeight: 1.5,
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = "#CA2A31"}
                          onMouseLeave={e => e.currentTarget.style.color = "#000000"}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p style={{
                          color: "#000000",
                          fontSize: "0.9375rem",
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.5,
                          margin: 0,
                        }}>
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div style={{ marginTop: "28px" }}>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#25D366",
                    color: "#fff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1ebe5d"}
                  onMouseLeave={e => e.currentTarget.style.background = "#25D366"}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* RIGHT — Contact form */}
            <div>
              <h2 style={{
                fontFamily: "'Rajdhani', 'Inter', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#000000",
                marginBottom: "24px",
                letterSpacing: "0.02em",
              }}>
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Name */}
                <div>
                  <label style={{
                    display: "block",
                    color: "#333333",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}>
                    Name *
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className={inputClass}
                    style={inputStyle}
                  />
                  {errors.name && <p style={{ color: "#CA2A31", fontSize: "0.75rem", marginTop: "4px", fontFamily: "'Inter', sans-serif" }}>{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={{
                    display: "block",
                    color: "#333333",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputClass}
                    style={inputStyle}
                  />
                  {errors.phone && <p style={{ color: "#CA2A31", fontSize: "0.75rem", marginTop: "4px", fontFamily: "'Inter', sans-serif" }}>{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: "block",
                    color: "#333333",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}>
                    Email <span style={{ color: "#666666", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputClass}
                    style={inputStyle}
                  />
                  {errors.email && <p style={{ color: "#CA2A31", fontSize: "0.75rem", marginTop: "4px", fontFamily: "'Inter', sans-serif" }}>{errors.email}</p>}
                </div>

                {/* Message */}
                <div>
                  <label style={{
                    display: "block",
                    color: "#333333",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}>
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className={inputClass}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                  {errors.message && <p style={{ color: "#CA2A31", fontSize: "0.75rem", marginTop: "4px", fontFamily: "'Inter', sans-serif" }}>{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting ? "rgba(255, 0, 0, 0.5)" : "#CA2A31",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "13px 28px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background 0.2s",
                    alignSelf: "flex-start",
                  }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#CC0000" }}
                  onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#CA2A31" }}
                >
                  {submitting ? (
                    <>
                      <div style={{
                        width: "16px", height: "16px",
                        border: "2px solid #FFFFFF",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
