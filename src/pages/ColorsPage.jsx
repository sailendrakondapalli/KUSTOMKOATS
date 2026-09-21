import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Filter } from 'lucide-react'
import { 
  CATEGORIES, 
  COLOR_FAMILIES 
} from '../data/products'
import {
  getAllColors,
  getCategoryForColor,
  SOLID_PEARLS,
  INTERFERENCE_PEARLS,
  CARBON_PEARLS,
  OEM_PLUS_PEARLS,
  SPECIAL_EFFECT_PEARLS,
  CHROMA_PEARLS
} from '../data/colors'
import { CATEGORY_DESCRIPTIONS } from '../config/contact'
import ScrollReveal from '../components/ScrollReveal'

export default function ColorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedColorFamily, setSelectedColorFamily] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const allColors = useMemo(() => getAllColors(), [])

  const filteredColors = useMemo(() => {
    return allColors.filter(color => {
      const matchesSearch = searchQuery === '' || 
        color.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'All' || 
        getCategoryForColor(color) === selectedCategory
      
      const matchesColorFamily = selectedColorFamily === 'All' ||
        color.toLowerCase().includes(selectedColorFamily.toLowerCase())
      
      return matchesSearch && matchesCategory && matchesColorFamily
    })
  }, [allColors, searchQuery, selectedCategory, selectedColorFamily])

  return (
    <>
      <Helmet>
        <title>Color Catalog - Kustom Koats | 300+ Automotive Pearls</title>
        <meta name="description" content="Explore over 300 automotive grade pearl colors for custom finishes. Premium quality Xtreme Kolorz pearls for professional automotive applications." />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
        {/* Hero Section */}
        <section className="w-full px-6 lg:px-12 xl:px-20 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" 
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              COLOR CATALOG
            </h1>
            <p className="text-lg md:text-xl mb-4" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
              Explore Over 300+ Automotive Grade Pearl Colors
            </p>
            <p className="text-base max-w-3xl mx-auto" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              From solid pearls to color-shifting effects, discover the perfect finish for your project
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="w-full px-6 lg:px-12 xl:px-20 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colors by name..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                  style={{
                    background: "#F8F8F8",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    fontFamily: "'Inter', sans-serif"
                  }}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  background: showFilters ? "#FF0000" : "#F8F8F8",
                  color: showFilters ? "#FFFFFF" : "#000000",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <Filter size={18} />
                Filters
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 rounded-lg"
                style={{ background: "#F8F8F8", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    Pearl Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...CATEGORIES].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: selectedCategory === cat ? "#FF0000" : "#FFFFFF",
                          color: selectedCategory === cat ? "#FFFFFF" : "#333333",
                          border: "1px solid " + (selectedCategory === cat ? "#FF0000" : "rgba(0, 0, 0, 0.1)"),
                          fontFamily: "'Inter', sans-serif"
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Family Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    Color Family
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...COLOR_FAMILIES].map(family => (
                      <button
                        key={family}
                        onClick={() => setSelectedColorFamily(family)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: selectedColorFamily === family ? "#FF0000" : "#FFFFFF",
                          color: selectedColorFamily === family ? "#FFFFFF" : "#333333",
                          border: "1px solid " + (selectedColorFamily === family ? "#FF0000" : "rgba(0, 0, 0, 0.1)"),
                          fontFamily: "'Inter', sans-serif"
                        }}
                      >
                        {family}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                Showing {filteredColors.length} of {allColors.length} colors
              </p>
              {(searchQuery || selectedCategory !== 'All' || selectedColorFamily !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setSelectedColorFamily('All')
                  }}
                  className="text-sm font-medium hover:text-[#FF0000] transition-colors"
                  style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Colors Grid */}
        <section className="w-full px-6 lg:px-12 xl:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            {filteredColors.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl mb-2" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
                  No colors found
                </p>
                <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredColors.map((colorName, idx) => {
                  const category = getCategoryForColor(colorName)
                  return (
                    <ScrollReveal key={colorName} delay={idx * 0.02}>
                      <div
                        className="group rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                        }}
                      >
                        {/* Color Sample */}
                        <div
                          className="w-full aspect-square relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #F8F8F8 0%, #E8E8E8 100%)"
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center px-4">
                              <div className="text-4xl font-bold mb-2" style={{ color: "#000000", opacity: 0.05 }}>
                                KK
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <p className="font-bold text-base mb-1 group-hover:text-[#FF0000] transition-colors"
                            style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                            {colorName}
                          </p>
                          <p className="text-xs" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                            {category}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Category Descriptions */}
        <section className="w-full px-6 lg:px-12 xl:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center" 
              style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              Pearl Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CATEGORIES.map(category => (
                <div key={category} className="p-6 rounded-lg"
                  style={{ background: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.1)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {category}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#333333", fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}>
                    {CATEGORY_DESCRIPTIONS[category]}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(category)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-sm font-medium hover:text-[#FF0000] transition-colors"
                    style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}
                  >
                    View Colors →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
