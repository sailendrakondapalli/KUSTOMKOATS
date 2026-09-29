import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'

const VALID_SLUGS = [
  'shipping-policy', 'refund-policy', 'privacy-policy',
  'military-discount', 'kk-rewards', 'privacy-choices', 'order-protection'
]

export default function PolicyPage() {
  const { pathname } = useLocation()
  const slug = pathname.replace('/', '')
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!VALID_SLUGS.includes(slug)) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const { data, error } = await supabase
          .from('site_pages_content')
          .select('*')
          .eq('page_key', slug)
          .maybeSingle()

        if (error) throw error
        if (!data || !data.hero_title) {
          setNotFound(true)
        } else {
          setPolicy({
            title: data.hero_title,
            subtitle: data.hero_subtitle,
            sections: Array.isArray(data.sections) ? data.sections : []
          })
        }
      } catch (err) {
        console.error('Failed to load policy page content:', err)
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", paddingTop: "96px" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #000000", borderTopColor: "transparent", borderRadius: "50%", animation: "policyspin 0.8s linear infinite" }} />
        <style>{`@keyframes policyspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (notFound || !policy) {
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
            {policy.subtitle && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: "#666666", marginTop: 10 }}>
                {policy.subtitle}
              </p>
            )}
          </div>

          {/* Sections */}
          {policy.sections.length === 0 ? (
            <p style={{ color: "#999999", fontFamily: "'Inter', sans-serif", textAlign: "center", padding: "24px 0" }}>
              Content coming soon.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {policy.sections.map((section, i) => (
                <div key={i} style={{
                  background: "#FFFFFF",
                  border: "2px solid #E5E5E5",
                  borderRadius: 12,
                  padding: "20px 24px",
                }}>
                  {section.heading && (
                    <h2 style={{ color: "#000000", fontWeight: 600, fontSize: "1rem", marginBottom: 10, fontFamily: "'Inter', sans-serif" }}>
                      {section.heading}
                    </h2>
                  )}
                  <p style={{ color: "#333333", fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-line", fontFamily: "'Inter', sans-serif" }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p style={{ color: "#999999", fontSize: "0.75rem", textAlign: "center", marginTop: 40, fontFamily: "'Inter', sans-serif" }}>
            Kustom Koats
          </p>
        </div>
      </div>
    </>
  )
}
