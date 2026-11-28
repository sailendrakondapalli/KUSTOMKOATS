import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, ChevronRight, Home } from 'lucide-react'
import { categoriesAPI } from '../services/apiClient'

function CategoryHeroBanner({ banner, categoryName }) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const bgImage = isMobile && banner.mobile_image_url ? banner.mobile_image_url : banner.desktop_image_url

  return (
    <section style={{ position: 'relative', minHeight: isMobile ? 240 : 380, background: '#000', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {bgImage && (
        <img src={bgImage} alt={banner.heading || categoryName}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} loading="eager" />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: isMobile ? '60px 20px 40px' : '100px 48px 80px', width: '100%', boxSizing: 'border-box' }}>
        {banner.heading && (
          <h1 style={{ color: '#FFF', fontFamily: "'Rajdhani', sans-serif", fontSize: isMobile ? '2rem' : 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.1, maxWidth: 600 }}>
            {banner.heading}
          </h1>
        )}
        {banner.subheading && (
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: "'Inter', sans-serif", fontSize: isMobile ? '0.9375rem' : '1.0625rem', maxWidth: 520, margin: '0 0 24px', lineHeight: 1.6 }}>
            {banner.subheading}
          </p>
        )}
        {banner.cta_text && banner.cta_link && (
          <Link to={banner.cta_link}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#CA2A31', color: '#FFF', borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#B02228'}
            onMouseLeave={e => e.currentTarget.style.background = '#CA2A31'}>
            {banner.cta_text} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </section>
  )
}

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!categorySlug) return
    setLoading(true)
    setError(null)

    categoriesAPI.getBySlug(categorySlug)
      .then(async res => {
        if (res?.data) {
          setCategory(res.data)
          // Fetch banners for this category
          try {
            const bannerRes = await categoriesAPI.getBanners(res.data.id)
            setBanners(bannerRes.data || [])
          } catch { setBanners([]) }
        } else {
          setError('Category not found')
        }
      })
      .catch(err => setError(err.message || 'Failed to load category'))
      .finally(() => setLoading(false))
  }, [categorySlug])

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFF', gap: 16 }}>
        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#000' }}>Category Not Found</h1>
        <Link to="/" style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}>← Back to Home</Link>
      </div>
    )
  }

  const activeSubcategories = (category.subcategories || []).filter(s => s.is_active)
  const activeBanner = banners.find(b => b.is_active) || null

  return (
    <>
      <Helmet>
        <title>{category.name} | Kustom Koats</title>
        <meta name="description" content={category.description || `Shop ${category.name} products at Kustom Koats`} />
      </Helmet>

      {/* Hero Banner — dynamic if set, else default */}
      {activeBanner ? (
        <CategoryHeroBanner banner={activeBanner} categoryName={category.name} />
      ) : (
        <section style={{ background: '#000', minHeight: 320, position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {category.image_url && (
            <img src={category.image_url} alt={category.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3))' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '80px 24px 60px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
                <Home size={12} /> Home
              </Link>
              <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ color: '#CA2A31', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{category.name}</span>
            </div>
            <p style={{ color: '#CA2A31', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>COLLECTION</p>
            <h1 style={{ color: '#FFF', fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1 }}>{category.name}</h1>
            {category.description && (
              <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: "'Inter', sans-serif", fontSize: '1.0625rem', maxWidth: 560, margin: 0, lineHeight: 1.6 }}>{category.description}</p>
            )}
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif" }}>
              {activeSubcategories.length} {activeSubcategories.length === 1 ? 'subcategory' : 'subcategories'}
            </div>
          </div>
        </section>
      )}

      {/* Breadcrumb under dynamic banner */}
      {activeBanner && (
        <div style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', padding: '12px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#888', fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif" }}>
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} style={{ color: '#CCC' }} />
            <span style={{ color: '#CA2A31', fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{category.name}</span>
          </div>
        </div>
      )}

      {/* Subcategories Grid */}
      <section style={{ background: '#FFF', padding: '60px 24px', maxWidth: 1280, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {activeSubcategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '1.75rem' }}>📦</span>
            </div>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000', margin: '0 0 8px' }}>
              Coming Soon
            </h3>
            <p style={{ color: '#888', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', margin: '0 0 20px' }}>
              Subcategories for {category.name} are being added.
            </p>
            <Link to="/" style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#000', margin: '0 0 6px' }}>
                Browse {category.name}
              </h2>
              <p style={{ color: '#888', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', margin: 0 }}>
                Select a subcategory to explore products
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 24,
            }}>
              {activeSubcategories.map(sub => (
                <Link
                  key={sub.id}
                  to={`/category/${categorySlug}/${sub.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    border: '1px solid #E5E5E5',
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'all 0.25s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#CA2A31'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(202,42,49,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
                    {/* Image */}
                    <div style={{ aspectRatio: '4/3', background: '#F5F5F5', overflow: 'hidden', position: 'relative' }}>
                      {sub.image_url ? (
                        <img src={sub.image_url} alt={sub.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '3rem', opacity: 0.15 }}>🎨</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px 20px' }}>
                      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.1875rem', fontWeight: 700, color: '#000', margin: '0 0 6px', lineHeight: 1.2 }}>
                        {sub.name}
                      </h3>
                      {sub.description && (
                        <p style={{ color: '#888', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {sub.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#CA2A31', fontSize: '0.8125rem', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                        View Products <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
