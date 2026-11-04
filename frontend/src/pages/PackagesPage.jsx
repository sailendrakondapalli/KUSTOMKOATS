import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Check, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const WHATSAPP_NUMBER = "919043700776"

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState('adult') // adult or kids
  const [adultPackages, setAdultPackages] = useState([])
  const [kidsPackages, setKidsPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Supabase error loading packages:', error)
        toast.error(`Failed to load packages: ${error.message}`)
        throw error
      }

      console.log('Loaded packages from database:', data)
      
      const adult = (data || []).filter(pkg => pkg.package_type === 'adult').map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        popular: pkg.is_popular,
        features: Array.isArray(pkg.features) ? pkg.features : (pkg.features ? JSON.parse(pkg.features) : []),
        color: pkg.is_popular ? '#9A7650' : '#B6A58F',
        description: pkg.description
      }))

      const kids = (data || []).filter(pkg => pkg.package_type === 'kids').map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        ageGroup: pkg.age_group,
        features: Array.isArray(pkg.features) ? pkg.features : (pkg.features ? JSON.parse(pkg.features) : []),
        description: pkg.description
      }))

      setAdultPackages(adult)
      setKidsPackages(kids)
    } catch (error) {
      console.error('Error loading packages:', error)
      // Fallback to sample data if database is not set up
      setAdultPackages([
        {
          id: 1,
          name: 'Basic',
          price: 2999,
          duration: 'month',
          popular: false,
          features: [
            'Access to group training sessions',
            'Basic equipment usage',
            '4 sessions per week',
            'Locker facility',
            'General fitness guidance',
          ],
          color: '#B6A58F'
        },
        {
          id: 2,
          name: 'Premium',
          price: 7999,
          duration: 'quarter',
          popular: true,
          features: [
            'All Basic features',
            'Unlimited training sessions',
            'Personal training (2 sessions/month)',
            'Advanced equipment access',
            'Nutrition consultation',
            'Free merchandise kit',
            'Priority event registration',
          ],
          color: '#9A7650'
        },
        {
          id: 3,
          name: 'Elite',
          price: 14999,
          duration: '6 months',
          popular: false,
          features: [
            'All Premium features',
            'Dedicated coach assignment',
            'Weekly personal training',
            'Customized training plan',
            'Diet chart & supplements guide',
            'Video analysis & feedback',
            'Competition preparation',
            'Premium locker with shower',
            'Free guest passes (2/month)',
          ],
          color: '#9A7650'
        },
      ])

      setKidsPackages([
        {
          id: 4,
          name: 'Junior Starter',
          price: 2499,
          duration: 'month',
          ageGroup: '5-12 years',
          features: [
            'Fun & engaging group classes',
            'Age-appropriate equipment',
            '3 sessions per week',
            'Safety gear included',
            'Progress tracking',
          ],
        },
        {
          id: 5,
          name: 'Teen Champion',
          price: 3499,
          duration: 'month',
          ageGroup: '13-18 years',
          features: [
            'Advanced skill development',
            'Competitive training',
            '5 sessions per week',
            'Tournament preparation',
            'Fitness & conditioning',
            'Mentorship program',
          ],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleEnquiry = (pkg) => {
    const text = `*Membership Enquiry*\n\nPackage: ${pkg.name}\nPrice: ₹${pkg.price}/${pkg.duration}\n\nI am interested in this membership package. Please provide more details and help me get started.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    toast.success('Enquiry sent!')
  }

  return (
    <>
      <Helmet>
        <title>Packages & Memberships - Academy</title>
        <meta name="description" content="Choose the perfect membership package for your goals" />
      </Helmet>

      <div className="min-h-screen py-20 px-6 lg:px-12 xl:px-20" style={{ background: '#5B1E28' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="eyebrow-label mb-3">Premium Offers</p>
            <h1 className="heading-editorial text-4xl mb-4">
              <span style={{ color: "#DDD4CF" }}>Packages &</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Memberships</span>
            </h1>
            <div className="equestrian-divider w-24 mx-auto mb-6" />
            <p className="text-[#B8955A] max-w-2xl mx-auto">
              Choose the perfect membership plan that fits your goals and schedule
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('adult')}
              className={`px-8 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-all ${
                activeTab === 'adult'
                  ? 'bg-[#9A7650] text-white'
                  : 'bg-[#762B35] text-[#B6A58F] hover:bg-[#762B35]'
              }`}
            >
              Adult Packages
            </button>
            <button
              onClick={() => setActiveTab('kids')}
              className={`px-8 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-all ${
                activeTab === 'kids'
                  ? 'bg-[#9A7650] text-white'
                  : 'bg-[#762B35] text-[#B6A58F] hover:bg-[#762B35]'
              }`}
            >
              Kids Packages
            </button>
          </div>

          {/* Adult Packages */}
          {activeTab === 'adult' && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-2 border-[#9A7650] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : adultPackages.length === 0 ? (
                <div className="text-center py-20 equestrian-card rounded-lg mb-16">
                  <p className="text-[#B6A58F] text-lg">No adult packages available</p>
                  <p className="text-[#B6A58F] text-sm mt-2">Check back soon for updates!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {adultPackages.map(pkg => (
                    <div 
                      key={pkg.id} 
                      className={`equestrian-card rounded-lg p-8 relative ${
                        pkg.popular ? 'ring-2 ring-[#9A7650]' : ''
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="bg-[#9A7650] text-white px-4 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1">
                            <Star size={12} fill="currentColor" />
                            Most Popular
                          </span>
                        </div>
                      )}

                      {/* Package Name */}
                      <h3 className="heading-editorial text-2xl mb-2">{pkg.name}</h3>
                      
                      {/* Price */}
                      <div className="mb-6">
                        <span className="text-4xl font-bold" style={{ color: pkg.color }}>
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#B6A58F] text-sm">/{pkg.duration}</span>
                      </div>

                      {/* Divider */}
                      <div className="equestrian-divider my-6" />

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-[#B8955A] text-sm">
                            <Check size={18} className="text-[#9A7650] flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Button */}
                      <button
                        onClick={() => handleEnquiry(pkg)}
                        className={`w-full py-3 rounded-lg font-medium uppercase tracking-wider transition-colors ${
                          pkg.popular
                            ? 'bg-[#9A7650] hover:bg-[#8A6640] text-white'
                            : 'bg-[#762B35] hover:bg-[#762B35] text-[#F3EBDD]'
                        }`}
                      >
                        Get Started
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Kids Packages */}
          {activeTab === 'kids' && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-2 border-[#9A7650] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : kidsPackages.length === 0 ? (
                <div className="text-center py-20 equestrian-card rounded-lg mb-16">
                  <p className="text-[#B6A58F] text-lg">No kids packages available</p>
                  <p className="text-[#B6A58F] text-sm mt-2">Check back soon for updates!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
                  {kidsPackages.map(pkg => (
                    <div key={pkg.id} className="equestrian-card rounded-lg p-8">
                      {/* Package Name */}
                      <h3 className="heading-editorial text-2xl mb-1">{pkg.name}</h3>
                      <p className="text-[#9A7650] text-sm mb-4 font-medium">{pkg.ageGroup}</p>
                      
                      {/* Price */}
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-[#9A7650]">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#B6A58F] text-sm">/{pkg.duration}</span>
                      </div>

                      {/* Divider */}
                      <div className="equestrian-divider my-6" />

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-[#B8955A] text-sm">
                            <Check size={18} className="text-[#9A7650] flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Button */}
                      <button
                        onClick={() => handleEnquiry(pkg)}
                        className="w-full bg-[#9A7650] hover:bg-[#8A6640] text-white py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
                      >
                        Get Started
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Benefits Section */}
          <div className="equestrian-card rounded-lg p-10 text-center">
            <h2 className="heading-editorial text-2xl mb-6">
              <span style={{ color: "#DDD4CF" }}>Why Choose Our</span> <span style={{ color: "#8B4938", fontStyle: "italic" }}>Memberships?</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {[
                { title: 'Flexible Plans', desc: 'Choose from monthly, quarterly, or annual packages' },
                { title: 'No Hidden Costs', desc: 'Transparent pricing with no surprise charges' },
                { title: 'Expert Coaches', desc: 'Learn from certified and experienced professionals' },
              ].map((benefit, i) => (
                <div key={i}>
                  <h4 className="text-[#9A7650] font-medium mb-2">{benefit.title}</h4>
                  <p className="text-[#B8955A] text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
            <a
              href="/enquiry"
              className="inline-block bg-[#9A7650] hover:bg-[#8A6640] text-white px-8 py-3 rounded-lg font-medium uppercase tracking-wider transition-colors"
            >
              Book Free Demo
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
