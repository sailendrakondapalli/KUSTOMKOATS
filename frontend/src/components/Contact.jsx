import { useState, useRef, useEffect } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.2 }
    )
    ref.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = encodeURIComponent(`Hi, I am ${form.name}, my number is ${form.phone}, message: ${form.message}`)
    window.open(`https://wa.me/917075928104?text=${text}`, '_blank')
  }

  return (
    <section
      className="contact"
      ref={ref}
    >
      <div className="contact-overlay" />
      <div className="contact-inner">
        <p className="section-subtitle reveal">Get In Touch</p>
        <h2 className="section-title reveal">Book Your Session</h2>
        <div className="section-divider reveal" />
        <form className="contact-form reveal" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              rows={4}
              placeholder="Tell us about your requirements..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="wa-btn contact-submit">
            💬 Send via WhatsApp
          </button>
        </form>
      </div>
    </section>
  )
}
