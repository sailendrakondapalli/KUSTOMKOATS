import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function WhyKustomKoatsPage() {
  return (
    <>
      <Helmet>
        <title>Why Kustom Koats - Kustom Koats</title>
        <meta name="description" content="What makes us the premier choice for automotive pearls" />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
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
              WHY KUSTOM KOATS
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              What makes us the premier choice for automotive pearls
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1 - Spray Gun */}
              <div className="text-center group">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <img 
                      src="/Spray Gun.png" 
                      alt="Premium Application"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ 
                    fontFamily: "'Rajdhani', sans-serif",
                    color: '#000000'
                  }}
                >
                  Premium Application
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ 
                    color: "#666666",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Professional-grade spray technology ensures flawless, even coverage with every application. Our advanced formulation delivers consistent results.
                </p>
              </div>

              {/* Column 2 - Chameleon */}
              <div className="text-center group">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <img 
                      src="/Chameleone.png" 
                      alt="Color Shifting Magic"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ 
                    fontFamily: "'Rajdhani', sans-serif",
                    color: '#000000'
                  }}
                >
                  Color Shifting Magic
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ 
                    color: "#666666",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Experience stunning color-shifting effects that transform your vehicle. Our chameleon pearls create mesmerizing visual depth and character.
                </p>
              </div>

              {/* Column 3 - Shield */}
              <div className="text-center group">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <img 
                      src="/Sheild.png" 
                      alt="Superior Protection"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ 
                    fontFamily: "'Rajdhani', sans-serif",
                    color: '#000000'
                  }}
                >
                  Superior Protection
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ 
                    color: "#666666",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Advanced protective coating shields your vehicle from UV rays, weathering, and environmental damage. Long-lasting durability guaranteed.
                </p>
              </div>

              {/* Column 4 - Globe */}
              <div className="text-center group">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <img 
                      src="/Globe.png" 
                      alt="Global Standards"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ 
                    fontFamily: "'Rajdhani', sans-serif",
                    color: '#000000'
                  }}
                >
                  Global Standards
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ 
                    color: "#666666",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Meets international quality standards and environmental regulations. Trusted by professionals worldwide for exceptional results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
