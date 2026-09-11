import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles, Layers, Diamond, Star, Zap, Eye } from "lucide-react"

export default function XtremeKolorzPage() {
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
              XTREME KOLORZ
            </h1>
            <p className="text-xl max-w-3xl mb-8" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Premium automotive grade pearls in six distinct families. Over 500+ colors engineered for professional results.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 rounded-lg" style={{ background: "rgba(255, 0, 0, 0.1)", border: "1px solid #FF0000" }}>
                <p className="text-sm font-bold" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>500+ Colors</p>
              </div>
              <div className="px-6 py-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
                <p className="text-sm font-bold" style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>6 Pearl Families</p>
              </div>
              <div className="px-6 py-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
                <p className="text-sm font-bold" style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>Automotive Grade</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pearl Families Grid */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
                SIX DISTINCT FAMILIES
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                Choose Your Perfect Finish
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pearlFamilies.map((family, idx) => (
                <div key={family.name} className="p-8 rounded-lg hover:shadow-xl transition-all duration-300" 
                  style={{ background: "#F8F8F8", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#FF0000" }}>
                    {family.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
                    {family.name}
                  </h3>
                  
                  <p className="text-sm mb-6" style={{ color: "#666666", fontFamily: "'Inter', sans-serif", lineHeight: "1.7" }}>
                    {family.description}
                  </p>
                  
                  <div className="mb-6">
                    <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      Key Features:
                    </p>
                    <ul className="space-y-2">
                      {family.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: "#FF0000", marginTop: "4px" }}>•</span>
                          <span className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6 py-3 px-4 rounded" style={{ background: "rgba(0, 0, 0, 0.03)" }}>
                    <p className="text-xs font-bold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                      {family.colors}
                    </p>
                  </div>
                  
                  <Link
                    to={`/products?category=${family.name.toLowerCase().replace('+', '')}`}
                    className="inline-block text-sm font-bold tracking-wide uppercase transition-colors hover:text-[#FF0000]"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      color: "#000000",
                      borderBottom: "2px solid #FF0000",
                      paddingBottom: "2px"
                    }}
                  >
                    View {family.name} Colors
                  </Link>
                </div>
              ))}
            </div>
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
                style={{ background: "#FF0000", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
              >
                Browse All Products
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:border-[#FF0000]"
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
