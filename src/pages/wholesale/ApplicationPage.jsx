import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, Building, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

export default function ApplicationPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    business_name: '',
    application_type: 'dealer',
    city: '',
    state: '',
    pincode: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('wholesale_applications')
        .insert([{
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      setSubmitted(true)
      toast.success('Application submitted successfully!')
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        business_name: '',
        application_type: 'dealer',
        city: '',
        state: '',
        pincode: '',
        message: ''
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/wholesale')
      }, 3000)

    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Application Submitted - Kustom Koats</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFFFF" }}>
          <div className="text-center px-6 max-w-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: "#F0FDF4", color: "#16A34A" }}>
              <CheckCircle size={48} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#000000", letterSpacing: "2px" }}>
              APPLICATION SUBMITTED!
            </h1>
            <p className="text-lg mb-8" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Thank you for your interest in partnering with Kustom Koats. We've received your application and will review it shortly.
            </p>
            <p className="text-sm mb-8" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
              Our team will contact you via email or phone within 2-3 business days.
            </p>
            <Link
              to="/wholesale"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:scale-105"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
            >
              Back to Wholesale Info
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Apply Now - Kustom Koats</title>
        <meta name="description" content="Submit your partnership application for dealer, distributor, or wholesaler access" />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        <section className="relative py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#000000" }}>
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/wholesale"
              className="inline-flex items-center gap-2 text-white hover:text-[#CA2A31] transition-colors mb-8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <ArrowLeft size={20} />
              Back to Wholesale
            </Link>
            
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '2px'
              }}
            >
              WHOLESALE APPLICATION
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Join our network of dealers, distributors, and wholesalers
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              {/* Application Type */}
              <div className="mb-8">
                <label className="block text-sm font-bold mb-4 uppercase tracking-wider"
                  style={{ color: "#000000", fontFamily: "'Inter', sans-serif", letterSpacing: "1.5px" }}>
                  Application Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'dealer', label: 'Dealer', desc: 'Local retail partners' },
                    { value: 'distributor', label: 'Distributor', desc: 'Regional distribution' },
                    { value: 'wholesaler', label: 'Wholesaler', desc: 'Bulk purchasing' }
                  ].map(type => (
                    <label key={type.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="application_type"
                        value={type.value}
                        checked={formData.application_type === type.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className={`p-6 border-2 rounded-lg transition-all ${
                        formData.application_type === type.value
                          ? 'border-[#CA2A31] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="font-bold text-lg mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}>
                          {type.label}
                        </div>
                        <div className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                          {type.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"
                  style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                  <User size={24} style={{ color: "#CA2A31" }} />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      placeholder="Your business name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"
                  style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                  <MapPin size={24} style={{ color: "#CA2A31" }} />
                  Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2"
                      style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"
                  style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                  <MessageSquare size={24} style={{ color: "#CA2A31" }} />
                  Additional Information
                </h3>
                
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us about your business, experience, and why you want to partner with Kustom Koats..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[#CA2A31] resize-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-4 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                
                <p className="text-sm" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
                  * Required fields
                </p>
              </div>

              <div className="mt-8 p-6 rounded-lg" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p className="text-sm" style={{ color: "#92400E", fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}>
                  <strong>Note:</strong> After submission, our team will review your application within 2-3 business days. 
                  You will receive an email notification once your application has been reviewed.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  )
}
