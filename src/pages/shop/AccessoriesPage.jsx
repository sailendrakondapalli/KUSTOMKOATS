import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft, Sprout, Pipette, Ruler, Droplet, PackageCheck, Wrench } from "lucide-react"
import { fetchProducts } from "../../services/productService"
import ProductCard from "../../components/ProductCard"
import SkeletonCard from "../../components/SkeletonCard"

export default function AccessoriesPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    console.log('AccessoriesPage: Fetching products with category:', 'Accessories')
    const data = await fetchProducts({ category: 'Accessories' })
    console.log('AccessoriesPage: Received products:', data)
    setProducts(data)
    setLoading(false)
  }

  const categories = [
    {
      icon: <Sprout size={32} />,
      title: "Spray Guns",
      description: "Professional HVLP spray guns optimized for pearl application",
      items: ["HVLP Spray Guns", "Touch-up Guns", "Detail Guns", "Gravity Feed"]
    },
    {
      icon: <Pipette size={32} />,
      title: "Mixing Tools",
      description: "Precision mixing equipment for consistent pearl ratios",
      items: ["Mixing Cups", "Stir Sticks", "Measuring Tools", "Funnels & Strainers"]
    },
    {
      icon: <Ruler size={32} />,
      title: "Application Tools",
      description: "Essential tools for perfect pearl application",
      items: ["Paint Strainers", "Tack Cloths", "Masking Materials", "Applicators"]
    },
    {
      icon: <Droplet size={32} />,
      title: "Clear Coats",
      description: "Premium clear coats designed for pearl finishes",
      items: ["Automotive Clear", "2K Clear Coat", "UV Protection", "Fast Dry Formula"]
    },
    {
      icon: <PackageCheck size={32} />,
      title: "Prep Materials",
      description: "Surface preparation products for optimal results",
      items: ["Surface Cleaners", "Degreasers", "Primers", "Adhesion Promoters"]
    },
    {
      icon: <Wrench size={32} />,
      title: "Maintenance",
      description: "Keep your equipment in perfect working condition",
      items: ["Spray Gun Cleaner", "Maintenance Kits", "Replacement Parts", "Storage Solutions"]
    }
  ]

  return (
    <>
      <Helmet>
        <title>Accessories - Professional Tools | Kustom Koats</title>
        <meta name="description" content="Professional tools and accessories for automotive finishing. Spray guns, mixing tools, and everything you need for perfect results." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Hero */}
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
              ACCESSORIES
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Complete your custom finish with professional tools and accessories. Everything you need for perfect application.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
                PROFESSIONAL TOOLS
              </p>
              <h2 className="text-3xl md:text-4xl font-bold"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                Everything You Need
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <div key={category.title} className="p-8 rounded-lg hover:shadow-xl transition-all" 
                  style={{ background: "#F8F8F8", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#CA2A31" }}>
                    {category.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                    {category.title}
                  </h3>
                  
                  <p className="text-sm mb-6" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    {category.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span style={{ color: "#CA2A31" }}>•</span>
                        <span className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={`/products?category=accessories`}
                    className="inline-block text-sm font-bold tracking-wide uppercase transition-colors hover:text-[#CA2A31]"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      color: "#000000",
                      borderBottom: "2px solid #CA2A31",
                      paddingBottom: "2px"
                    }}
                  >
                    View Products
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#F8F8F8" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
                SHOP NOW
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                Accessories & Tools
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl mb-4" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                  No products available yet
                </p>
                <p className="text-sm" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
                  Check back soon for new products!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="text-center">
                  <p style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
              Need Help Choosing?
            </h3>
            <p className="text-lg mb-8" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Our experts can recommend the perfect tools for your project and skill level.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:scale-105"
              style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
            >
              Contact Our Experts
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
