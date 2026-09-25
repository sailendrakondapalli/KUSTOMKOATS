import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const policies = {
  'shipping-policy': {
    title: 'Booking & Scheduling Policy',
    sections: [
      {
        heading: 'Session Booking',
        text: 'All riding sessions must be booked at least 24 hours in advance. Walk-in bookings are subject to horse and trainer availability.\n\nPlease contact us via WhatsApp or phone to confirm your slot.'
      },
      {
        heading: 'Session Timings',
        text: 'Sessions run Monday to Sunday, 6:00 AM - 8:00 PM IST.\n\nMorning slots (6 AM - 9 AM) and evening slots (5 PM - 8 PM) are most popular - book early to secure your preferred time.'
      },
      {
        heading: 'Cancellation by You',
        text: 'If you need to cancel, please notify us at least 12 hours before your session.\n\nCancellations made less than 12 hours before the session may not be eligible for a rescheduling.'
      },
      {
        heading: 'Cancellation by Us',
        text: 'In cases of extreme weather, horse health issues, or other unforeseen circumstances, we may need to reschedule your session.\n\nWe will notify you as early as possible and offer an alternative slot.'
      },
      {
        heading: 'Contact',
        text: '• Phone / WhatsApp: +91 90437 00776\n• info@royalhoof.com\n• GIRI FARMS, Uniworld City, Aspen Greens, Nallambakkam, Tamil Nadu'
      },
    ]
  },
  'refund-policy': {
    title: 'Refund Policy',
    sections: [
      {
        heading: 'Package Refunds',
        text: 'If you have purchased a riding package and wish to cancel before your first session, a full refund will be issued within 5-7 working days.\n\nOnce sessions have commenced, refunds are available on a pro-rated basis for unused sessions only.'
      },
      {
        heading: 'Single Session Refunds',
        text: 'Single session fees are non-refundable after the session has taken place.\n\nIf a session is cancelled by Royal Hoof, a full refund or complimentary rescheduling will be offered.'
      },
      {
        heading: 'How to Request a Refund',
        text: 'Contact us via WhatsApp or email with your name, booking details, and reason for the refund request.\n\n• WhatsApp: +91 90437 00776\n• info@royalhoof.com\n\nRefunds are processed within 5-7 working days after approval.'
      },
      {
        heading: 'Non-Refundable Items',
        text: 'Riding equipment rental fees, coaching consultation fees, and event registration fees are non-refundable once the service has been rendered.'
      },
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      { heading: 'Information We Collect', text: 'We collect your name, email address, phone number, and booking details when you make an enquiry or book a session.' },
      { heading: 'How We Use It', text: 'Your information is used solely to confirm bookings, send reminders, and communicate updates. We do not sell or share your data with third parties.' },
      { heading: 'Data Security', text: 'All data is stored securely. Payment transactions are handled via trusted third-party processors and we do not store card details.' },
      { heading: 'Cookies', text: 'We use cookies to improve site performance and remember your preferences. You can disable cookies in your browser settings.' },
      { heading: 'Contact', text: 'For any privacy concerns:\n• info@royalhoof.com\n• +91 90437 00776' },
    ]
  }
}

export default function PolicyPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace('/', '')
  const policy = policies[slug]

  if (!policy) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", paddingTop: "96px" }}>
        <p style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>Page not found.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{policy.title} - Kustom Koats</title>
      </Helmet>

      <div style={{ background: "#FFFFFF", minHeight: "100vh", padding: "96px 24px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid #E5E5E5" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#666666", marginBottom: 10, fontWeight: 600 }}>
              Kustom Koats
            </p>
            <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, color: "#000000", lineHeight: 1.15 }}>
              {policy.title}
            </h1>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {policy.sections.map((section, i) => (
              <div key={i} style={{
                background: "#FFFFFF",
                border: "2px solid #E5E5E5",
                borderRadius: 12,
                padding: "20px 24px",
              }}>
                <h2 style={{ color: "#000000", fontWeight: 600, fontSize: "1rem", marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>
                  {section.heading}
                </h2>
                <p style={{ color: "#333333", fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-line", fontFamily: "'Inter', sans-serif" }}>
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <p style={{ color: "#999999", fontSize: "0.75rem", textAlign: "center", marginTop: 40, fontFamily: "'Inter', sans-serif" }}>
            Last updated: March 2024 - Kustom Koats
          </p>
        </div>
      </div>
    </>
  )
}
