import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Shield, CheckCircle, Star, Palette, Sparkles, Zap, Award, TrendingUp, Package, Droplet, Clock, Globe } from "lucide-react"
import { fetchProducts } from "../services/productService"
import ProductCard from "../components/ProductCard"
import SkeletonCard from "../components/SkeletonCard"
import ScrollReveal from "../components/ScrollReveal"
import ReviewsSection from "../components/ReviewsSection"
import WhyKustomKoatsNeon from "../components/WhyKustomKoatsNeon"

const PX = "px-6 lg:px-12 xl:px-20"

/* --- Hero Section --- */
function HeroSection() {
  // Animation variants for word-by-word reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 25 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  // Split text into words for animation - each word on same line
  const AnimatedWords = ({ text, className, style }) => {
    const words = text.split(' ')
    return (
      <motion.div 
        className={className}
        style={style}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    )
  }

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
      
      {/* Content - Left Aligned */}
      <div className="relative w-full h-full flex flex-col items-start justify-center px-6 sm:px-12 lg:px-16 max-w-7xl">
        <div className="text-left space-y-0">
          {/* Small Top Text */}
          <AnimatedWords
            text="INSPIRED BY PASSION"
            className="text-xs md:text-sm font-bold tracking-widest mb-4"
            style={{ 
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#FFFFFF',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          />
          
          {/* Main Heading - Stacked Lines */}
          <div className="space-y-0 mb-8">
            <AnimatedWords
              text="MAKE YOUR"
              className="block text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)',
                marginBottom: '-0.1em'
              }}
            />
            <AnimatedWords
              text="PRESENCE"
              className="block text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)',
                marginBottom: '-0.1em'
              }}
            />
            <AnimatedWords
              text="FEEL"
              className="block text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)',
                marginBottom: '-0.1em'
              }}
            />
            <AnimatedWords
              text="IMPOSSIBLE"
              className="block text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)',
                marginBottom: '-0.1em'
              }}
            />
            <AnimatedWords
              text="TO IGNORE"
              className="block text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.3)'
              }}
            />
          </div>
        </div>

        {/* CTA Button - Left Aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <Link 
            to="/shop/xtreme-kolorz"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-sm font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105"
            style={{ 
              background: "#FFFFFF",
              color: "#000000",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.1em'
            }}
          >
            DISCOVER MORE
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
                  <div className="relative aspect-[4/3] rounded-lg mb-4 overflow-hidden">
                    {loading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : (
                      <img 
                        src={displayImage}
                        alt={product?.name || category.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  <div className="relative aspect-[4/3] rounded-lg mb-4 overflow-hidden">
                    {loading ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : (
                      <img 
                        src={displayImage}
                        alt={product?.name || category.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FFFFFF" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FFFFFF" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#F8F8F8" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FFFFFF" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#F8F8F8" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FFFFFF" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FFFFFF" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FFFFFF" }}>
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
    <section className={`w-full py-12 ${PX}`} style={{ background: "#FF0000" }}>
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

/* --- Why Kustom Koats Premium Section --- */
function WhyKustomKoatsSection() {
  const features = [
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M25 15L30 25H50L55 15M15 35H65L60 55H20L15 35Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="25" cy="60" r="5" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="55" cy="60" r="5" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M35 45L40 40L50 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "PREMIUM AUTOMOTIVE FINISHES",
      subtitle: "EXTREME COLOR EFFECTS",
      description: "Designed + grade coatings exclusively used by enthusiasts. Topped for the highest quality material for ultimate results and standout finish."
    },
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 15C25 15 15 25 15 40C15 55 25 65 40 65C55 65 65 55 65 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M40 25V40H55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="40" cy="40" r="3" fill="currentColor"/>
        </svg>
      ),
      title: "BUILD TO LAST",
      subtitle: "",
      description: "Durable, high - performance materials stand the test of time - providing lasting impact and unforgettable looks"
    },
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 15L50 35L70 38L55 52L58 72L40 62L22 72L25 52L10 38L30 35L40 15Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M35 40L38 45L45 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "TRUSTED FORMULAS",
      subtitle: "WORLDWIDE",
      description: "Time-tested, commercial color chemistries proven to deliver vivid, long-lasting and unforgettable looks"
    },
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M40 20V40L55 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 50L30 60M60 20L50 30M20 30L30 20M60 60L50 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
      title: "",
      subtitle: "",
      description: ""
    }
  ]

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollPosition = 0
    const scrollSpeed = 1
    const cardWidth = 280 + 24
    const totalWidth = cardWidth * features.length

    const scroll = () => {
      scrollPosition += scrollSpeed
      if (scrollPosition >= totalWidth) {
        scrollPosition = 0
      }
      container.scrollLeft = scrollPosition
    }

    const intervalId = setInterval(scroll, 30)
    const handlePointerEnter = () => clearInterval(intervalId)

    container.addEventListener('mouseenter', handlePointerEnter)
    container.addEventListener('touchstart', handlePointerEnter)

    return () => {
      clearInterval(intervalId)
      container.removeEventListener('mouseenter', handlePointerEnter)
      container.removeEventListener('touchstart', handlePointerEnter)
    }
  }, [features.length])

  return (
    <section 
      className="relative w-full py-20 overflow-hidden"
      style={{ 
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a1a2e 100%)",
        position: "relative"
      }}
    >
      {/* Neon glow effects */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "200px",
          height: "100%",
          background: "linear-gradient(90deg, rgba(255, 0, 255, 0.3) 0%, transparent 100%)",
          filter: "blur(80px)",
          pointerEvents: "none"
        }}
      />
      <div 
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "200px",
          height: "100%",
          background: "linear-gradient(270deg, rgba(0, 150, 255, 0.3) 0%, transparent 100%)",
          filter: "blur(80px)",
          pointerEvents: "none"
        }}
      />

      <div className={`relative max-w-7xl mx-auto ${PX}`}>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-4"
            style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
            WHY KUSTOM KOATS ?
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: "'Rajdhani', sans-serif", 
              color: "#FFFFFF",
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
            PREMIUM FINISHES. MAXIMUM IMPACT.
          </h2>
          <p className="text-sm md:text-base max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
            At Kustom Koats, we don't just make colors - we create automotive excellence.<br/>
            Engineered for performance. Design to turn heads.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative group"
              style={{
                background: "rgba(10, 10, 10, 0.8)",
                backdropFilter: "blur(10px)",
                padding: "40px 24px",
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Hover neon border effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(180deg, 
                    ${idx === 0 ? 'rgba(255, 0, 255, 0.3)' : 
                      idx === 1 ? 'rgba(138, 43, 226, 0.3)' : 
                      idx === 2 ? 'rgba(255, 0, 128, 0.3)' : 
                      'rgba(0, 150, 255, 0.3)'} 0%, 
                    transparent 100%)`,
                  pointerEvents: "none"
                }}
              />

              {/* Icon */}
              <div 
                className="mb-8 transition-all duration-500 group-hover:scale-110"
                style={{
                  color: idx === 0 ? '#FF00FF' : 
                         idx === 1 ? '#8A2BE2' : 
                         idx === 2 ? '#FF0080' : 
                         '#0096FF',
                  filter: `drop-shadow(0 0 20px ${
                    idx === 0 ? '#FF00FF80' : 
                    idx === 1 ? '#8A2BE280' : 
                    idx === 2 ? '#FF008080' : 
                    '#0096FF80'
                  })`
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              {feature.title && (
                <h3 
                  className="text-sm md:text-base font-bold tracking-wider uppercase mb-2"
                  style={{ 
                    color: "#FFFFFF", 
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.1em",
                    lineHeight: "1.4"
                  }}
                >
                  {feature.title}
                </h3>
              )}

              {/* Subtitle */}
              {feature.subtitle && (
                <p 
                  className="text-xs font-bold tracking-widest uppercase mb-6"
                  style={{ 
                    color: idx === 0 ? '#FF00FF' : 
                           idx === 1 ? '#8A2BE2' : 
                           idx === 2 ? '#FF0080' : 
                           '#0096FF',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.15em"
                  }}
                >
                  {feature.subtitle}
                </p>
              )}

              {/* Description */}
              {feature.description && (
                <p 
                  className="text-xs md:text-sm leading-relaxed"
                  style={{ 
                    color: "#AAAAAA", 
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: "1.7"
                  }}
                >
                  {feature.description}
                </p>
              )}

              {/* Decorative line */}
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 transition-all duration-500 group-hover:w-3/4"
                style={{
                  width: "30%",
                  background: idx === 0 ? '#FF00FF' : 
                             idx === 1 ? '#8A2BE2' : 
                             idx === 2 ? '#FF0080' : 
                             '#0096FF',
                  boxShadow: `0 0 10px ${
                    idx === 0 ? '#FF00FF' : 
                    idx === 1 ? '#8A2BE2' : 
                    idx === 2 ? '#FF0080' : 
                    '#0096FF'
                  }`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --- CTA Section --- */
function CTASection() {
  return (
    <section className={`w-full py-12 ${PX}`} 
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

/* --- Newsletter Subscribe Section --- */
function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address')
      return
    }

    setLoading(true)
    setMessage('')

    // Simulate newsletter subscription
    setTimeout(() => {
      setMessage('Thank you for subscribing!')
      setEmail('')
      setLoading(false)
    }, 1500)
  }

  return (
    <section className={`w-full py-16 ${PX}`} style={{ background: "#FFFFFF" }}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold mb-3 tracking-[0.15em] uppercase" 
            style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
            GET LATEST MINIMALISM NEWS
          </p>
          <h2 className="text-3xl md:text-4xl font-normal mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#000000", fontWeight: 400 }}>
            Newsletter Subscribe
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" 
            style={{ color: "#666666", fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}>
            It only takes a second to be the first to find out about our news and promotions.
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              className="flex-1 px-5 py-3.5 rounded-md text-sm outline-none transition-all"
              style={{ 
                border: "1px solid #E5E5E5",
                fontFamily: "'Inter', sans-serif",
                color: "#000000",
                background: "#FFFFFF"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-md font-medium text-sm uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
              style={{ 
                background: "#000000", 
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className="text-sm" style={{ 
              color: message.includes('Thank') ? '#16A34A' : '#EF4444',
              fontFamily: "'Inter', sans-serif" 
            }}>
              {message}
            </p>
          )}
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Follow Us Section --- */
function FollowUsSection() {
  const socialLinks = [
    { 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ), 
      label: 'Facebook', 
      url: 'https://facebook.com/kustomkoats',
      color: '#1877F2'
    },
    { 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ), 
      label: 'Twitter', 
      url: 'https://twitter.com/kustomkoats',
      color: '#1DA1F2'
    },
    { 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      ), 
      label: 'Instagram', 
      url: 'https://instagram.com/kustomkoats',
      color: '#E4405F'
    },
    { 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ), 
      label: 'LinkedIn', 
      url: 'https://linkedin.com/company/kustomkoats',
      color: '#0A66C2'
    },
    { 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ), 
      label: 'YouTube', 
      url: 'https://youtube.com/@kustomkoats',
      color: '#FF0000'
    }
  ]

  return (
    <section className={`w-full py-16 ${PX}`} style={{ background: "#FAFAFA" }}>
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-normal mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#000000", fontWeight: 400 }}>
            Follow Us
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto" 
            style={{ color: "#666666", fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}>
            It only takes a second to be the first to find out about our news and promotions.
          </p>

          {/* Social Icons */}
          <div className="flex justify-center items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ 
                  border: "1px solid #E5E5E5",
                  background: "#FFFFFF",
                  color: "#666666"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = social.color
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.borderColor = social.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.color = '#666666'
                  e.currentTarget.style.borderColor = '#E5E5E5'
                }}
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}

/* --- Fixed Video Background Section --- */
function FixedVideoSection() {
  const videoRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Improved autoplay handling
    const attemptPlay = async () => {
      try {
        // Set video properties before playing
        video.muted = true
        video.playsInline = true
        await video.play()
        console.log('Video playing successfully')
      } catch (err) {
        console.log('Initial autoplay prevented, will retry on scroll:', err.message)
      }
    }

    // Intersection Observer to ensure play when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && video.paused) {
          attemptPlay()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Initial play attempt
    attemptPlay()

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ 
        height: 'clamp(600px, 100vh, 1000px)',
        background: '#000000'
      }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/bgfixedscroll.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for cinematic effect */}
      <div 
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      />

      {/* Optional content overlay */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* You can add text or other content here if needed */}
      </div>
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

      <div className="min-h-screen">
        <HeroSection />
        <FeaturedCategoriesSection />
        <SignatureSeriesSection />
        <WhyKustomKoatsNeon />
        <FixedVideoSection />
        <NewsletterSection />
        <FollowUsSection />
        <ReviewsSection />
      </div>
    </>
  )
}

