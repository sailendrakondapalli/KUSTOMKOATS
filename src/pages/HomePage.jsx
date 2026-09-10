import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Shield, CheckCircle, Star, Palette, Sparkles, Zap, Award } from "lucide-react"
import { CATEGORIES } from "../data/products"
import { CATEGORY_DESCRIPTIONS, CONTACT_INFO, PRODUCT_INFO } from "../config/contact"
import { fetchProducts } from "../services/productService"
import ProductCard from "../components/ProductCard"
import SkeletonCard from "../components/SkeletonCard"
import ScrollReveal from "../components/ScrollReveal"
import ReviewsSection from "../components/ReviewsSection"

const PX = "px-6 lg:px-12 xl:px-20"

/* --- Hero Section --- */
function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(550px, 85vh, 800px)" }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/Kustom Koats Hero Page.mov" type="video/mp4" />
      </video>
      
      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider mb-6" 
              style={{ 
                fontFamily: "'Rajdhani', 'Inter', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '0.08em',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)'
              }}>
            KUSTOM KOATS
          </h1>
          <p className="text-xl md:text-2xl tracking-wide uppercase mb-4" 
             style={{ 
               fontFamily: "'Inter', sans-serif",
               color: '#FFFFFF',
               letterSpacing: '0.12em',
               textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
             }}>
            {CONTACT_INFO.company.tagline}
          </p>
          <p className="text-base md:text-lg max-w-2xl mx-auto" 
             style={{ 
               fontFamily: "'Inter', sans-serif",
               color: '#F0F0F0',
               lineHeight: '1.8',
               textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
             }}>
            Premium automotive pearls with over 300+ colors. From solid pearls to mind-bending Chroma effects.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link 
            to="/colors"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FF0000",
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
            }}
          >
            <Palette size={22} />
            Explore Colors
          </Link>
          <Link 
            to="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FFFFFF",
              color: "#000000",
              border: "2px solid rgba(0, 0, 0, 0.2)",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Shop Products
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* --- Pearl Categories Showcase --- */
function PearlCategoriesSection() {
  const categoryImages = {
    'Solid Pearls': '/categories/solid-pearls.jpg',
    'Interference Pearls': '/categories/interference-pearls.jpg',
    'Carbon Pearls': '/categories/carbon-pearls.jpg',
    'OEM+ Pearls': '/categories/oem-pearls.jpg',
    'Special Effect Pearls': '/categories/special-effect-pearls.jpg',
    'Chroma Pearls': '/categories/chroma-pearls.jpg',
  }

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
              PEARL CATEGORIES
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Six Distinct Pearl Families
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Each category offers unique characteristics and visual effects for automotive applications
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {CATEGORIES.map((category, idx) => (
              <ScrollReveal key={category} delay={idx * 0.1}>
                <Link to="/colors" 
                  className="group block text-center transition-all duration-300 hover:opacity-80"
                >
                  {/* Image */}
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={categoryImages[category] || '/categories/placeholder.jpg'} 
                      alt={category}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100"><div class="text-center px-4"><div class="text-4xl font-bold" style="color: #000000; opacity: 0.1;">KK</div></div></div>`
                      }}
                    />
                  </div>

                  {/* Label */}
                  <h3 className="text-sm font-semibold group-hover:text-[#FF0000] transition-colors" 
                    style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {category}
                  </h3>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Featured Products Section --- */
function FeaturedProductsSection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts({ limit: 8 })
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#F8F8F8" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm font-bold mb-2 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
              PRODUCTS
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Featured Products
            </h2>
          </div>
          <Link to="/products" 
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:gap-3 duration-300"
            style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
            View All <ArrowRight size={16} style={{ color: "#FF0000" }} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>No products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* --- Why Choose Section --- */
function WhyChooseSection() {
  const features = [
    {
      icon: <Award size={32} />,
      title: "300+ Colors",
      description: "The largest selection of automotive grade pearls in India"
    },
    {
      icon: <Shield size={32} />,
      title: "Premium Quality",
      description: "Mica and silica based pearls that are non-toxic and inert"
    },
    {
      icon: <Zap size={32} />,
      title: "Fast Shipping",
      description: "Most products ship within 7 working days"
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Expert Support",
      description: "Technical support and color matching assistance"
    }
  ]

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
              WHY KUSTOM KOATS
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Premium Automotive Pearls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <ScrollReveal key={feature.title} delay={idx * 0.1}>
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#FF0000" }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- CTA Section --- */
function CTASection() {
  return (
    <section className={`w-full py-20 ${PX}`} 
      style={{ 
        background: "linear-gradient(135deg, #F8F8F8 0%, #FFFFFF 100%)",
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)"
      }}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
            Ready to Transform Your Project?
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
            Join the partner program for special pricing and technical support, or browse our complete catalog
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <Star size={20} />
              Become a Partner
            </Link>
            
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-black/20 text-black hover:border-[#FF0000] hover:text-[#FF0000] px-8 py-4 rounded-lg font-bold transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Contact Us
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Main Component --- */
export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Kustom Koats - Premium Automotive Grade Pearls | 300+ Colors</title>
        <meta name="description" content="Explore 300+ automotive grade pearl colors. Solid Pearls, Interference Pearls, Carbon Pearls, OEM+ Pearls, Special Effect Pearls, and Chroma Pearls. Premium quality from Kustom Koats." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        <HeroSection />
        <PearlCategoriesSection />
        <FeaturedProductsSection />
        <WhyChooseSection />
        <CTASection />
        <ReviewsSection />
      </div>
    </>
  )
}
