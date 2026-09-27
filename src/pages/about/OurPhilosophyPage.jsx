import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { supabase } from "../../lib/supabase"

const DEFAULTS = {
  hero_title: "OUR PHILOSOPHY",
  hero_subtitle: "Our values and approach to automotive finishing",
  sections: []
}

export default function OurPhilosophyPage() {
  const [content, setContent] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_pages_content')
      .select('*')
      .eq('page_key', 'our-philosophy')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setContent({
            hero_title: data.hero_title || DEFAULTS.hero_title,
            hero_subtitle: data.hero_subtitle || DEFAULTS.hero_subtitle,
            sections: Array.isArray(data.sections) ? data.sections : []
          })
        }
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Helmet>
        <title>{content.hero_title} - Kustom Koats</title>
        <meta name="description" content={content.hero_subtitle} />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        <section className="relative py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#000000" }}>
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-white hover:text-[#CA2A31] transition-colors mb-8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '2px'
              }}
            >
              {content.hero_title}
            </h1>
            {content.hero_subtitle && (
              <p className="text-lg max-w-2xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
                {content.hero_subtitle}
              </p>
            )}
          </div>
        </section>

        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            ) : content.sections.length > 0 ? (
              <div className="max-w-3xl space-y-12">
                {content.sections.map((sec, idx) => (
                  <div key={idx}>
                    {sec.heading && (
                      <h2 className="text-2xl md:text-3xl font-bold mb-4"
                        style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                        {sec.heading}
                      </h2>
                    )}
                    {sec.body && (
                      <p className="text-lg leading-relaxed whitespace-pre-line"
                        style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                        {sec.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-lg mb-8" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                Content coming soon.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
