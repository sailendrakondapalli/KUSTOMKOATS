import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft, Shield, Zap, Award, Droplets } from "lucide-react"
import { fetchProducts } from "../../services/productService"
import ProductCard from "../../components/ProductCard"
import SkeletonCard from "../../components/SkeletonCard"

export default function XtremeWrapPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const data = await fetchProducts({ category: 'Xtreme Wrap' })
    setProducts(data)
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Xtreme Wrap - Professional Vinyl Wraps | Kustom Koats</title>
        <meta name="description" content="Professional grade vinyl wraps with pearl finishes for complete vehicle transformations. Durable, flexible, and stunning." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Hero */}
        <section className="relative py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#000000" }}>
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-white hover:text-[#FF0000] transition-colors mb-8"
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
              XTREME WRAP
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Professional grade vinyl wraps with pearl finishes for complete vehicle transformations. Removable, durable, and stunning.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { icon: <Shield size={32} />, title: "Paint Protection", desc: "Protects original paint" },
                { icon: <Zap size={32} />, title: "Quick Install", desc: "Faster than repainting" },
                { icon: <Award size={32} />, title: "Premium Finish", desc: "Show-quality results" },
                { icon: <Droplets size={32} />, title: "Weather Resistant", desc: "UV and water resistant" }
              ].map((item) => (
                <div key={item.title} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#FF0000" }}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                Available Finishes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                {['Gloss Pearl', 'Matte Pearl', 'Satin Pearl', 'Color Shift', 'Carbon Fiber', 'Chrome'].map((finish) => (
                  <div key={finish} className="p-6 rounded-lg" style={{ background: "#F8F8F8" }}>
                    <h4 className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      {finish}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Section */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                Xtreme Wrap Products
              </h2>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    No Xtreme Wrap products available yet
                  </p>
                  <p className="text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Check back soon for new vinyl wrap products!
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
                    <p className="text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Showing {products.length} product{products.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#000000" }}>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#FFFFFF" }}>
              Transform Your Vehicle
            </h3>
            <p className="text-lg mb-8" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Contact us for quotes, installation services, and color samples.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:scale-105"
              style={{ background: "#FF0000", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
            >
              Get a Quote
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
