import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    number: "01",
    image: "/Spray Gun.png",
    title: "PREMIUM AUTOMOTIVE FINISHES",
    description: "Professional-grade coatings designed for the highest quality and standout results."
  },
  {
    number: "02",
    image: "/Chameleone.png",
    title: "EXTREME COLOR EFFECTS",
    description: "Chosen by enthusiasts, customizers and professionals across the globe."
  },
  {
    number: "03",
    image: "/Sheild.png",
    title: "BUILD TO LAST",
    description: "Durable, high-performance coatings engineered to withstand the test of time."
  },
  {
    number: "04",
    image: "/Globe.png",
    title: "TRUSTED FORMULAS WORLDWIDE",
    description: "Trusted by automotive professionals and enthusiasts in countries around the world."
  }
]

export default function WhyKustomKoatsNeon() {
  return (
    <section
      style={{
        background: '#000000',
        position: 'relative',
        zIndex: 5,
        overflow: 'hidden',
        padding: '80px 0 72px',
      }}
    >
      {/* Ambient red glow — corners only */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(202,42,49,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)', transform: 'translate(-30%, -30%)'
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(202,42,49,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)', transform: 'translate(30%, 30%)'
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* ── Section header ── */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#CA2A31',
            marginBottom: 16,
          }}>
            WHY KUSTOM KOATS ?
          </p>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            lineHeight: 1.05,
            margin: '0 0 24px',
          }}>
            PREMIUM FINISHES. MAXIMUM IMPACT.
          </h2>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 560,
            margin: '0 auto',
          }}>
            At Kustom Koats, we don't just make colors — we create experiences.
            Engineered for performance. Designed to turn heads.
          </p>
        </div>

        {/* ── Feature grid ── */}
        {/*
          Desktop: 4-column CSS grid with subgrid rows so every row track is
          shared across all 4 columns — icons, titles, descriptions and accents
          all start at exactly the same vertical position regardless of content.
          Mobile: 2-column, then 1-column below 480px.
        */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
        }}
          className="why-grid"
        >
          {features.map((f, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                // 4 fixed row tracks: icon · title · description · accent
                gridTemplateRows: '120px auto 1fr 24px',
                padding: '36px 28px 0',
                borderRight: idx < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                position: 'relative',
                textAlign: 'center',
              }}
              className="why-card"
            >
              {/* Row 1 — Icon (120px fixed) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
              }}>
                <div style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: 'rgba(202,42,49,0.08)',
                  border: '1px solid rgba(202,42,49,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(202,42,49,0.25), 0 0 48px rgba(202,42,49,0.1)',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                }}
                  className="why-icon-wrap"
                >
                  <img
                    src={f.image}
                    alt={f.title}
                    style={{
                      width: 44, height: 44,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 6px rgba(202,42,49,0.7)) brightness(0) saturate(100%) invert(22%) sepia(96%) saturate(2476%) hue-rotate(337deg) brightness(87%) contrast(105%)',
                    }}
                  />
                </div>
              </div>

              {/* Row 2 — Number + Title (auto height) */}
              <div style={{ marginBottom: 16 }}>
                <p style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '0.875rem',
                  letterSpacing: '0.2em',
                  color: '#CA2A31',
                  marginBottom: 8,
                }}>
                  {f.number}
                </p>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {f.title}
                </h3>
              </div>

              {/* Row 3 — Description (flex-1 so all cards stretch equally) */}
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8125rem',
                lineHeight: 1.85,
                color: 'rgba(255,255,255,0.5)',
                margin: '0 0 28px',
                padding: '0 4px',
              }}>
                {f.description}
              </p>

              {/* Row 4 — Red accent line (24px track) */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingTop: 0,
                marginBottom: 28,
              }}>
                <div style={{
                  width: 40, height: 2,
                  background: 'linear-gradient(90deg, transparent, #CA2A31, transparent)',
                  boxShadow: '0 0 8px rgba(202,42,49,0.6)',
                  transition: 'width 0.3s',
                }}
                  className="why-accent"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <Link
            to="/about/why-kustom-koats"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 36px',
              borderRadius: 3,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.0625rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: '#CA2A31',
              color: '#FFFFFF',
              textDecoration: 'none',
              boxShadow: '0 0 24px rgba(202,42,49,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 36px rgba(202,42,49,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(202,42,49,0.4)'
            }}
          >
            DISCOVER MORE <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        /* Hover effects */
        .why-card:hover .why-icon-wrap {
          box-shadow: 0 0 36px rgba(202,42,49,0.45), 0 0 64px rgba(202,42,49,0.18);
          transform: scale(1.06);
        }
        .why-card:hover .why-accent {
          width: 60px;
        }

        /* Tablet: 2 columns */
        @media (max-width: 900px) {
          .why-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .why-card:nth-child(2) {
            border-right: none !important;
          }
          .why-card:nth-child(1),
          .why-card:nth-child(2) {
            border-bottom: 1px solid rgba(255,255,255,0.07);
          }
        }

        /* Mobile: 1 column */
        @media (max-width: 480px) {
          .why-grid {
            grid-template-columns: 1fr !important;
          }
          .why-card {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.07) !important;
            padding: 28px 20px 0 !important;
          }
          .why-card:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>
    </section>
  )
}
