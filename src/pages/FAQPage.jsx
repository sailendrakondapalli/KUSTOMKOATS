import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState([])
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_published', true)
          .order('category', { ascending: true })
          .order('sort_order', { ascending: true })

        if (error) throw error
        setFaqs(data || [])
      } catch (err) {
        console.error('Failed to load FAQs:', err)
      }
      setLoading(false)
    }
    loadFaqs()
  }, [])

  const toggleItem = (key) => {
    setOpenItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  // Group flat FAQ rows into categories for display
  const categories = faqs.reduce((acc, faq) => {
    let group = acc.find(c => c.category === faq.category)
    if (!group) {
      group = { category: faq.category, questions: [] }
      acc.push(group)
    }
    group.questions.push({ id: faq.id, q: faq.question, a: faq.answer })
    return acc
  }, [])

  const filteredFAQs = searchTerm.trim() === ''
    ? categories
    : categories.map(category => ({
        ...category,
        questions: category.questions.filter(item =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)

  return (
    <>
      <Helmet>
        <title>FAQ - Frequently Asked Questions | Kustom Koats</title>
        <meta name="description" content="Find answers to common questions about Kustom Koats products, orders, and wholesale program." />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
              Help Center
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#000000', letterSpacing: '2px' }}>
              Frequently Asked Questions
            </h1>
            <div style={{ width: 60, height: 3, background: '#CA2A31', margin: '0 auto 24px' }} />
            <p className="max-w-2xl mx-auto" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
              Find answers to the most common questions about our products, orders, and wholesale program
            </p>
          </div>

          {/* Search */}
          <div className="mb-10">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#999999' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search for questions..."
                className="w-full rounded-lg pl-12 pr-4 py-4 focus:outline-none transition-colors"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  color: '#000000',
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = '#000000'}
                onBlur={e => e.target.style.borderColor = '#E0E0E0'}
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div style={{ width: 32, height: 32, border: '3px solid #000000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'faqspin 0.8s linear infinite' }} />
            </div>
          ) : filteredFAQs.length === 0 ? (
            <div className="text-center py-16 rounded-lg" style={{ background: '#F8F8F8', border: '1px solid #EEEEEE' }}>
              <p style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                {faqs.length === 0 ? 'No FAQs available yet.' : `No results found for "${searchTerm}"`}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-sm font-medium"
                  style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQs.map((category) => (
                <div key={category.category}>
                  {/* Category Title */}
                  <h2 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: '#CA2A31', fontFamily: "'Inter', sans-serif" }}>
                    {category.category}
                  </h2>

                  {/* Questions */}
                  <div className="space-y-3">
                    {category.questions.map((item) => {
                      const isOpen = openItems.includes(item.id)
                      return (
                        <div key={item.id} className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
                            style={{ background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F8F8F8'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="font-medium pr-4" style={{ color: '#000000', fontFamily: "'Inter', sans-serif" }}>{item.q}</span>
                            <ChevronDown
                              size={20}
                              className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              style={{ color: '#CA2A31' }}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4 pt-2" style={{ borderTop: '1px solid #EEEEEE' }}>
                              <p className="leading-relaxed" style={{ color: '#666666', fontFamily: "'Inter', sans-serif" }}>{item.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still have questions CTA */}
          <div className="mt-16 text-center rounded-lg p-10" style={{ background: '#000000' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FFFFFF', letterSpacing: '1px' }}>
              Still Have Questions?
            </h2>
            <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}>
              Can't find what you're looking for? Our team is here to help you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/contact"
                className="inline-block px-8 py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
                style={{ background: '#CA2A31', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes faqspin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
