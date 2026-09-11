import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft, Sprout, Pipette, Ruler, Droplet, PackageCheck, Wrench } from "lucide-react"

export default function AccessoriesPage() {
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
              <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#FF0000", fontFamily: "'Inter', sans-serif" }}>
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
                    style={{ background: "rgba(255, 0, 0, 0.05)", color: "#FF0000" }}>
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
                        <span style={{ color: "#FF0000" }}>•</span>
                        <span className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={`/products?category=accessories`}
                    className="inline-block text-sm font-bold tracking-wide uppercase transition-colors hover:text-[#FF0000]"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      color: "#000000",
                      borderBottom: "2px solid #FF0000",
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

        {/* Why Quality Tools Matter */}
        <section className="py-20 px-6 lg:px-12 xl:px-20" style={{ background: "#F8F8F8" }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000" }}>
              Quality Tools = Quality Results
            </h2>
            <p className="text-lg mb-12" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Professional-grade tools ensure consistent application, reduce waste, and deliver show-winning finishes every time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Better Application", desc: "Precise control and even coverage" },
                { title: "Less Waste", desc: "Efficient material usage" },
                { title: "Professional Results", desc: "Consistent, high-quality finishes" }
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-lg" style={{ background: "#FFFFFF" }}>
                  <h4 className="text-lg font-bold mb-2" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {item.title}
                  </h4>
                  <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
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
              style={{ background: "#FF0000", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}
            >
              Contact Our Experts
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
