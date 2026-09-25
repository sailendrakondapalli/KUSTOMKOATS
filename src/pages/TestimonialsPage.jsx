import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Star, Quote } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setTestimonials(data || [])
      } catch (error) {
        console.error('Error fetching testimonials:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : 5.0

  return (
    <>
      <Helmet>
        <title>Testimonials - Kustom Koats</title>
        <meta name="description" content="Read what our customers say about Kustom Koats custom automotive finishes" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
              REVIEWS & FEEDBACK
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              What Our Customers Say
            </h1>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: `${averageRating}/5`, label: 'Average Rating' },
              { value: '95%', label: 'Satisfaction Rate' },
              { value: `${testimonials.length}+`, label: 'Reviews' },
            ].map((stat, i) => (
              <div key={i} className="rounded-lg p-6 text-center" style={{ background: '#F8F8F8' }}>
                <p className="text-3xl font-bold mb-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: '#CA2A31' }}>
                  {stat.value}
                </p>
                <p className="text-sm uppercase tracking-wider" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonials Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-lg p-6 animate-pulse" style={{ background: '#F8F8F8' }}>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(j => (
                      <div key={j} className="w-4 h-4 bg-gray-300 rounded-sm" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-300 rounded" />
                    <div className="h-4 bg-gray-300 rounded w-5/6" />
                    <div className="h-4 bg-gray-300 rounded w-4/6" />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-300">
                    <div className="w-12 h-12 bg-gray-300 rounded-full" />
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-300 rounded w-20" />
                      <div className="h-3 bg-gray-300 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg mb-4" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                No testimonials available yet.
              </p>
              <p className="text-sm" style={{ color: '#999999', fontFamily: "'Inter', sans-serif" }}>
                Check back soon for customer reviews!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="rounded-lg p-6 relative hover:shadow-lg transition-shadow" style={{ background: '#F8F8F8' }}>
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-5">
                    <Quote size={48} style={{ color: '#000000' }} />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#CA2A31" stroke="none" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#333333', fontFamily: "'Inter', sans-serif" }}>
                    "{testimonial.review}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #E0E0E0' }}>
                    <img 
                      src={testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=CA2A31&color=fff`}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=CA2A31&color=fff`
                      }}
                    />
                    <div>
                      <p className="font-semibold" style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                        {testimonial.name}
                      </p>
                      {testimonial.role && (
                        <p className="text-xs" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center rounded-lg p-10" style={{ background: '#F8F8F8' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Want to Share Your Experience?
            </h2>
            <p className="text-base mb-6 max-w-2xl mx-auto" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
              We'd love to hear from you! Share your feedback and help others make the right choice.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              style={{ 
                background: "#CA2A31", 
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                textDecoration: 'none'
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
