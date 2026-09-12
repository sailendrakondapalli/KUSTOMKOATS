import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Shield, CheckCircle, Star, Palette, Sparkles, Zap, Award, TrendingUp, Package } from "lucide-react"
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
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '79px',
                lineHeight: '70px',
                letterSpacing: '1.9px',
                wordSpacing: '1px',
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)'
              }}>
            INSPIRED BY PASSION
          </h1>
          <p className="text-xl md:text-2xl tracking-wide uppercase mb-4" 
             style={{ 
               fontFamily: "'Inter', sans-serif",
               color: '#FFFFFF',
               letterSpacing: '0.12em',
               textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
             }}>
            MAKE YOUR PRESENCE FEEL IMPOSSIBLE TO IGNORE
          </p>
          <p className="text-base md:text-lg max-w-2xl mx-auto" 
             style={{ 
               fontFamily: "'Inter', sans-serif",
               color: '#F0F0F0',
               lineHeight: '1.8',
               textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
             }}>
            DISCOVER MORE
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link 
            to="/shop/xtreme-kolorz"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FF0000",
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
            }}
          >
            <Palette size={22} />
            Explore Xtreme Kolorz
          </Link>
          <Link 
            to="/shop/xtreme-kolorz"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg tracking-wide uppercase transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FFFFFF",
              color: "#000000",
              border: "2px solid rgba(0, 0, 0, 0.2)",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Shop Now
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* --- Featured Categories Section (After Hero) --- */
function FeaturedCategoriesSection() {
  const [categoryProducts, setCategoryProducts] = useState({
    'Xtreme Wrap': null,
    'Xtreme Kolorz': null,
    'Accessories': null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true)
      try {
        // Fetch one product from each category
        const [wrapProducts, kolorzProducts, accessoryProducts] = await Promise.all([
          fetchProducts({ category: 'Xtreme Wrap', limit: 1 }),
          fetchProducts({ category: 'Xtreme Kolorz', limit: 1 }),
          fetchProducts({ category: 'Accessories', limit: 1 })
        ])
        
        setCategoryProducts({
          'Xtreme Wrap': wrapProducts[0] || null,
          'Xtreme Kolorz': kolorzProducts[0] || null,
          'Accessories': accessoryProducts[0] || null
        })
      } catch (error) {
        console.error('Failed to load category products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCategoryProducts()
  }, [])

  const categories = [
    {
      title: "Xtreme Wrap",
      image: "/categories/image.png",
      link: "/shop/xtreme-wrap",
      product: categoryProducts['Xtreme Wrap']
    },
    {
      title: "Xtreme Kolorz",
      image: "/categories/image.png",
      link: "/shop/xtreme-kolorz",
      product: categoryProducts['Xtreme Kolorz']
    },
    {
      title: "Accessories",
      image: "/categories/image.png",
      link: "/shop/accessories",
      product: categoryProducts['Accessories']
    }
  ]

  return (
    <section className={`w-full py-16 ${PX}`} style={{ background: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
          {categories.map((category, idx) => {
            const product = category.product
            const displayImage = product?.images?.[0] || category.image
            const targetLink = product ? `/products/${product.id}` : category.link
            
            return (
              <div key={category.title} className="flex-shrink-0 w-[80vw] snap-center">
                <Link to={targetLink} className="relative group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                    {loading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : (
                      <img 
                        src={displayImage}
                        alt={product?.name || category.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = category.image
                        }}
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider" 
                      style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
                      {category.title}
                    </p>
                    <h3 
                      className="text-2xl font-bold"
                      style={{ 
                        fontFamily: "'Rajdhani', 'Inter', sans-serif", 
                        color: "#000000" 
                      }}
                    >
                      {product?.name || category.title}
                    </h3>
                    {product && (
                      <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                        ₹{product.price}
                      </p>
                    )}
                    <div
                      className="inline-block text-sm font-bold tracking-wider uppercase transition-colors group-hover:text-[#FF0000]"
                      style={{ 
                        fontFamily: "'Inter', sans-serif",
                        color: "#000000",
                        borderBottom: "2px solid #FF0000",
                        paddingBottom: "2px"
                      }}
                    >
                      {product ? 'VIEW PRODUCT' : 'SHOP NOW'}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {categories.map((category, idx) => {
            const product = category.product
            const displayImage = product?.images?.[0] || category.image
            const targetLink = product ? `/products/${product.id}` : category.link
            
            return (
              <ScrollReveal key={category.title} delay={idx * 0.15}>
                <Link to={targetLink} className="relative group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                    {loading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : (
                      <img 
                        src={displayImage}
                        alt={product?.name || category.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = category.image
                        }}
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider" 
                      style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
                      {category.title}
                    </p>
                    <h3 
                      className="text-2xl font-bold"
                      style={{ 
                        fontFamily: "'Rajdhani', 'Inter', sans-serif", 
                        color: "#000000" 
                      }}
                    >
                      {product?.name || category.title}
                    </h3>
                    {product && (
                      <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                        ₹{product.price}
                      </p>
                    )}
                    <div
                      className="inline-block text-sm font-bold tracking-wider uppercase transition-colors group-hover:text-[#FF0000]"
                      style={{ 
                        fontFamily: "'Inter', sans-serif",
                        color: "#000000",
                        borderBottom: "2px solid #FF0000",
                        paddingBottom: "2px"
                      }}
                    >
                      {product ? 'VIEW PRODUCT' : 'SHOP NOW'}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* --- Xtreme Kolorz Section --- */
function XtremeKolorzSection() {
  const categories = [
    { name: 'Solid+', image: '/categories/solid-pearls.jpg', to: '/shop/xtreme-kolorz?category=solid' },
    { name: 'Interference+', image: '/categories/interference-pearls.jpg', to: '/shop/xtreme-kolorz?category=interference' },
    { name: 'Carbon+', image: '/categories/carbon-pearls.jpg', to: '/shop/xtreme-kolorz?category=carbon' },
    { name: 'OEM+', image: '/categories/oem-pearls.jpg', to: '/shop/xtreme-kolorz?category=oem' },
    { name: 'Special Effect+', image: '/categories/special-effect-pearls.jpg', to: '/shop/xtreme-kolorz?category=special-effect' },
    { name: 'Chroma Effect+', image: '/categories/chroma-pearls.jpg', to: '/shop/xtreme-kolorz?category=chroma' },
  ]

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
              XTREME KOLORZ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Six Pearl Families
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Each category offers unique characteristics and visual effects for automotive applications
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {categories.map((category, idx) => (
              <ScrollReveal key={category.name} delay={idx * 0.1}>
                <Link to={category.to} 
                  className="group block text-center transition-all duration-300 hover:opacity-80"
                >
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100"><div class="text-center px-4"><div class="text-4xl font-bold" style="color: #000000; opacity: 0.1;">KK</div></div></div>`
                      }}
                    />
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-[#FF0000] transition-colors" 
                    style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {category.name}
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

/* --- Xtreme Wrap Section --- */
function XtremeWrapSection() {
  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
            Xtreme Wrap
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
            Professional grade vinyl wraps with pearl finishes
          </p>
          <Link
            to="/shop/xtreme-wrap"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FF0000", 
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            Explore Wraps <ArrowRight size={20} />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Accessories Section --- */
function AccessoriesSection() {
  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#F8F8F8" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Accessories
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Complete your custom finish with professional tools and accessories
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/shop/accessories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                border: "2px solid #000000",
                color: "#000000",
                fontFamily: "'Inter', sans-serif" 
              }}
            >
              View All Accessories <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Kustom Signature Series Section --- */
function SignatureSeriesSection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Fetch products - you can filter by a specific tag or just get recent products
        const data = await fetchProducts({ limit: 8 })
        setProducts(data)
      } catch (error) {
        console.error('Failed to load signature products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-5xl font-bold mb-2 tracking-wider uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#000000", letterSpacing: "3px" }}
            >
              KUSTOM SIGNATURE SERIES
            </h2>
          </div>

          {/* Products List - Image + Text Layout */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
              {products.map((product) => (
                <ScrollReveal key={product.id}>
                  <Link to={`/products/${product.id}`} className="group block">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                      <img 
                        src={product.images?.[0] || '/categories/image.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/categories/image.png'
                        }}
                      />
                    </div>
                    
                    {/* Product Name */}
                    <h3 
                      className="text-base md:text-lg lg:text-xl font-bold mb-2 transition-colors group-hover:text-[#FF0000]"
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        color: "#000000",
                        lineHeight: "1.4"
                      }}
                    >
                      {product.name}
                    </h3>
                    
                    {/* Category */}
                    <p 
                      className="text-xs md:text-sm mb-3"
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        color: "#666666"
                      }}
                    >
                      {product.category}
                    </p>
                    
                    {/* Read More Link */}
                    <div
                      className="inline-flex items-center gap-2 text-xs md:text-sm font-medium transition-all group-hover:gap-3"
                      style={{ 
                        fontFamily: "'Inter', sans-serif", 
                        color: "#FF0000"
                      }}
                    >
                      Read more 
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                No products available
              </p>
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-16">
            <Link
              to="/shop/xtreme-kolorz"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              style={{ 
                background: "#000000", 
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif" 
              }}
            >
              View All Products <Star size={20} />
            </Link>
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
              ORIGINAL CANDY KOLORZ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Signature Candy Finishes
            </h2>
          </div>
          <Link to="/shop/xtreme-kolorz?category=candy" 
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

/* --- Find Your Finish Section --- */
function FindYourFinishSection() {
  const finishes = [
    { name: "Metallic", icon: <Sparkles size={32} />, description: "Classic shimmer with depth" },
    { name: "Candy", icon: <Palette size={32} />, description: "Transparent color layers" },
    { name: "Pearl", icon: <Award size={32} />, description: "Multi-dimensional flip" },
    { name: "Chroma", icon: <Zap size={32} />, description: "Extreme color shifting" },
  ]

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
              FIND YOUR FINISH
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Discover Your Perfect Look
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {finishes.map((finish, idx) => (
              <ScrollReveal key={finish.name} delay={idx * 0.1}>
                <div className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-xl"
                  style={{ background: "#F8F8F8" }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#FF0000" }}>
                    {finish.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {finish.name}
                  </h3>
                  <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    {finish.description}
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

/* --- Built With Kustom Koats Section --- */
function BuiltWithKKSection() {
  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
            SHOWCASE
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
            Built With Kustom Koats
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
            See what professionals are creating with our premium pearls
          </p>
          <Link
            to="/kulture/projects"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FF0000", 
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            View Projects <ArrowRight size={20} />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Kustom Kulture Section --- */
function KustomKultureSection() {
  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
              KUSTOM KULTURE
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Stories From The Garage
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/kulture/journal" className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: "#F8F8F8", color: "#000000", fontFamily: "'Inter', sans-serif" }}>
              Kustom Journal
            </Link>
            <Link to="/kulture/events" className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: "#F8F8F8", color: "#000000", fontFamily: "'Inter', sans-serif" }}>
              Events
            </Link>
            <Link to="/kulture/how-to" className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: "#F8F8F8", color: "#000000", fontFamily: "'Inter', sans-serif" }}>
              How-To Guides
            </Link>
            <Link to="/kulture/university" className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: "#F8F8F8", color: "#000000", fontFamily: "'Inter', sans-serif" }}>
              KK University
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- First Order Discount Section --- */
function FirstOrderSection() {
  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#FF0000" }}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#FFFFFF" }}>
            Get 10% Off Your First Order
          </h3>
          <p className="text-lg mb-8" style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
            Join our community and receive exclusive discounts on premium automotive pearls
          </p>
          <Link
            to="/shop/xtreme-kolorz"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FFFFFF", 
              color: "#000000",
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Why Kustom Koats Section --- */
function WhyChooseSection() {
  const scrollContainerRef = useRef(null)
  
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

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollPosition = 0
    const scrollSpeed = 1 // pixels per frame
    const cardWidth = 280 + 24 // card width + gap
    const totalWidth = cardWidth * features.length

    const scroll = () => {
      scrollPosition += scrollSpeed
      
      // Reset to start when we've scrolled through one full set
      if (scrollPosition >= totalWidth) {
        scrollPosition = 0
      }
      
      container.scrollLeft = scrollPosition
    }

    const intervalId = setInterval(scroll, 30) // ~33fps

    // Pause on hover/touch
    const handlePointerEnter = () => clearInterval(intervalId)
    const handlePointerLeave = () => {
      clearInterval(intervalId)
      const newIntervalId = setInterval(scroll, 30)
      return () => clearInterval(newIntervalId)
    }

    container.addEventListener('mouseenter', handlePointerEnter)
    container.addEventListener('touchstart', handlePointerEnter)

    return () => {
      clearInterval(intervalId)
      container.removeEventListener('mouseenter', handlePointerEnter)
      container.removeEventListener('touchstart', handlePointerEnter)
    }
  }, [features.length])

  return (
    <section className={`w-full py-20 ${PX}`} style={{ background: "#F8F8F8" }}>
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

          {/* Mobile: Auto-scrolling Horizontal Carousel */}
          <div 
            ref={scrollContainerRef}
            className="md:hidden overflow-x-auto pb-4 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'auto'
            }}>
            <div className="flex gap-6" style={{ width: 'max-content' }}>
              {/* Triple duplicate for seamless infinite loop */}
              {[...features, ...features, ...features].map((feature, idx) => (
                <div 
                  key={`feature-${idx}`}
                  className="flex-shrink-0 text-center p-6"
                  style={{ width: '280px' }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#FF0000" }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
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
                  <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
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
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
            Join our wholesale program for special pricing and technical support, or browse our complete catalog
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/wholesale/why-partner"
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
        <meta name="description" content="Explore 300+ automotive grade pearl colors. Xtreme Kolorz, Xtreme Wrap, Original Candy, and Signature Series. Premium quality from Kustom Koats." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        <HeroSection />
        <FeaturedCategoriesSection />
        <SignatureSeriesSection />
        <WhyChooseSection />
      </div>
    </>
  )
}
