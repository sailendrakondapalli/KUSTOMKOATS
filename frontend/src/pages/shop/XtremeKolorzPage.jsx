import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles, Layers, Diamond, Star, Zap, Eye } from "lucide-react"
import { fetchProducts } from "../../services/productService"
import ProductCard from "../../components/ProductCard"
import SkeletonCard from "../../components/SkeletonCard"

export default function XtremeKolorzPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    console.log('XtremeKolorzPage: Fetching products with category:', 'Xtreme Kolorz')
    const data = await fetchProducts({ category: 'Xtreme Kolorz' })
    console.log('XtremeKolorzPage: Received products:', data)
    setProducts(data)
    setLoading(false)
  }
  const pearlFamilies = [
    {
      name: "Solid+",
      icon: <Diamond size={32} />,
      description: "Classic solid metallic pearls with deep, rich color and consistent coverage. Perfect for traditional custom finishes.",
      features: ["Deep color saturation", "Excellent coverage", "UV resistant", "Easy to spray"],
      colors: "100+ colors available"
    },
    {
      name: "Interference+",
      icon: <Layers size={32} />,
      description: "Multi-dimensional pearls that shift between two distinct colors depending on viewing angle and light source.",
      features: ["Dual color shift", "Angular dynamics", "Transparent base", "Layerable effects"],
      colors: "75+ colors available"
    },
    {
      name: "Carbon+",
      icon: <Sparkles size={32} />,
      description: "Metallic pearls with carbon fiber-like texture and depth. Adds dimensional texture to any finish.",
      features: ["Textured appearance", "Carbon fiber effect", "High contrast", "Premium look"],
      colors: "40+ colors available"
    },
    {
      name: "OEM+",
      icon: <Star size={32} />,
      description: "Factory-matched automotive pearls that replicate OEM finishes with precision and authenticity.",
      features: ["OEM color matching", "Factory spec quality", "Perfect blending", "Certified formulas"],
      colors: "200+ OEM matches"
    },
    {
      name: "Special Effect+",
      icon: <Zap size={32} />,
      description: "Unique specialty pearls including ghost pearls, flip pearls, and custom effect pigments.",
      features: ["Unique effects", "Ghost pearls", "Flip pigments", "Custom blends"],
      colors: "50+ effects available"
    },
    {
      name: "Chroma Effect+",
      icon: <Eye size={32} />,
      description: "Extreme color-shifting pearls with multiple color transitions. The ultimate in dynamic automotive finishes.",
      features: ["Multi-color shift", "Extreme dynamics", "Premium quality", "Show-winning effects"],
      colors: "30+ chromatic colors"
    }
  ]

  return (
    <>
      <Helmet>
        <title>Xtreme Kolorz - Premium Automotive Pearls | Kustom Koats</title>
        <meta name="description" content="Explore our Xtreme Kolorz collection featuring 6 pearl families: Solid+, Interference+, Carbon+, OEM+, Special Effect+, and Chroma Effect+. 500+ colors available." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Hero Header */}
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
              XTREME KOLORZ
            </h1>
            <p className="text-xl max-w-3xl mb-8" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Premium automotive grade pearls in six distinct families. Over 500+ colors engineered for professional results.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 rounded-lg" style={{ background: "rgba(255, 0, 0, 0.1)", border: "1px solid #CA2A31" }}>
                <p className="text-sm font-bold" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>500+ Colors</p>
              </div>
              <div className="px-6 py-3 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.05)", border: "1px solid rgba(0, 0, 0, 0.2)" }}>
                <p className="text-sm font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>6 Pearl Families</p>
              </div>
              <div className="px-6 py-3 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.05)", border: "1px solid rgba(0, 0, 0, 0.2)" }}>
                <p className="text-sm font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Automotive Grade</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section - MOVED TO 2ND POSITION */}
        <section className="py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#F8F8F8" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
                BROWSE OUR CATALOG
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                Xtreme Kolorz Products
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

        {/* Why Choose Xtreme Kolorz */}
        <section className="py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#000000" }}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: "'Rajdhani', sans-serif", color: "#FFFFFF" }}>
              Why Choose Xtreme Kolorz?
            </h2>
            <p className="text-lg max-w-3xl mx-auto mb-12" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Professional-grade automotive pearls engineered for superior performance, consistency, and stunning results.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "UV Resistant", desc: "Long-lasting color stability" },
                { title: "Easy Application", desc: "Spray-friendly formulation" },
                { title: "Consistent Quality", desc: "Batch-to-batch reliability" },
                { title: "Technical Support", desc: "Expert guidance available" }
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <h4 className="text-lg font-bold mb-2" style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
                    {item.title}
                  </h4>
                  <p className="text-sm" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
              Ready to Transform Your Project?
            </h3>
            <p className="text-lg mb-8" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Browse our complete catalog or contact us for color matching and technical support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:scale-105"
                style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
              >
                Browse All Products
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:border-[#CA2A31]"
                style={{ background: "transparent", border: "2px solid #000000", color: "#000000", fontFamily: "'Inter', sans-serif" }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
