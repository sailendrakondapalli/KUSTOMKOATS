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
    console.log('XtremeWrapPage: Fetching products with category:', 'Xtreme Wrap')
    const data = await fetchProducts({ category: 'Xtreme Wrap' })
    console.log('XtremeWrapPage: Received products:', data)
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
              XTREME WRAP
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Professional grade vinyl wraps with pearl finishes for complete vehicle transformations. Removable, durable, and stunning.
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
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
                    No products available yet
                  </p>
                  <p className="text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
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
              style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
            >
              Get a Quote
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
