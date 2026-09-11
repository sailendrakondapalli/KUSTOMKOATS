import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { fetchProducts } from "../../services/productService"
import ProductCard from "../../components/ProductCard"
import SkeletonCard from "../../components/SkeletonCard"

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const filters = {}
        if (filter !== 'all') filters.category = filter
        if (sort) filters.sort = sort
        
        const data = await fetchProducts(filters)
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [filter, sort])

  const categories = [
    { label: 'All Products', value: 'all' },
    { label: 'Xtreme Kolorz', value: 'Xtreme Kolorz' },
    { label: 'Xtreme Wrap', value: 'Xtreme Wrap' },
    { label: 'Accessories', value: 'Accessories' }
  ]

  return (
    <>
      <Helmet>
        <title>Shop All Products - Automotive Pearls & Finishes | Kustom Koats</title>
        <meta name="description" content="Browse our complete collection of automotive grade pearls, vinyl wraps, and accessories. Premium quality finishes for custom automotive applications." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Hero */}
        <section className="relative py-16 px-6 lg:px-12 xl:px-20" style={{ background: "#000000" }}>
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-white hover:text-[#FF0000] transition-colors mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '2px'
              }}
            >
              SHOP ALL PRODUCTS
            </h1>
            <p className="text-xl max-w-3xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Explore our complete collection of automotive grade pearls, wraps, and accessories
            </p>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-12 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} style={{ color: "#666666" }} />
                <span className="text-sm font-medium" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                  {loading ? 'Loading...' : `${products.length} Products`}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#FF0000]"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#FF0000]"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#000000" }}
                >
                  <option value="">Sort By</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg mb-4" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                  No products found
                </p>
                <p className="text-sm mb-8" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
                  Try adjusting your filters or check back later
                </p>
                <button
                  onClick={() => { setFilter('all'); setSort('') }}
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ 
                    background: "#FF0000",
                    color: "#FFFFFF",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
