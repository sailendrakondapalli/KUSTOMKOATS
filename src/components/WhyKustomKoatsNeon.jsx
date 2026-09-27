import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ScrollReveal from './ScrollReveal'

const PX = "px-6 lg:px-12 xl:px-20"

export default function WhyKustomKoatsNeon() {
  const features = [
    {
      image: "/Spray Gun.png",
      title: "PREMIUM AUTOMOTIVE FINISHES",
      subtitle: "",
      description: "Professional-grade coatings designed for the highest quality and standout results."
    },
    {
      image: "/Chameleone.png",
      title: "EXTREME COLOR EFFECTS",
      subtitle: "",
      description: "Chosen by enthusiasts, customizers and professionals across the globe"
    },
    {
      image: "/Sheild.png",
      title: "BUILD TO LAST",
      subtitle: "",
      description: "Durable, high-performance coatings engineered to withstand the test of time."
    },
    {
      image: "/Globe.png",
      title: "TRUSTED FORMULAS WORLDWIDE",
      subtitle: "",
      description: "Trusted by automotive professionals and enthusiasts in countries around the world."
    }
  ]

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-24 overflow-hidden" 
      style={{ 
        background: "#000000",
        position: "relative",
        zIndex: 5
      }}>
      
      {/* Red glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #CA2A31 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #CA2A31 0%, transparent 70%)" }} />
      
      <div className={`relative max-w-7xl mx-auto ${PX}`}>
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <p className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 tracking-[0.3em] uppercase" 
              style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
              WHY KUSTOM KOATS ?
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight px-4"
              style={{ 
                fontFamily: "'Rajdhani', sans-serif", 
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                lineHeight: "1.1"
              }}>
              PREMIUM FINISHES. MAXIMUM IMPACT.
            </h2>
            <p className="text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed px-4" 
              style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif", opacity: 0.8 }}>
              At Kustom Koats, we don't just make colors - we create experiences.
              <br className="hidden sm:block" />
              Engineered for performance. Design to turn heads.
            </p>
          </div>
        </ScrollReveal>

        {/* iPhone mockup container */}
        <div className="relative max-w-5xl mx-auto mb-8 sm:mb-12">
          {/* iPhone frame - auto height on mobile, aspect ratio on desktop */}
          <div className="relative mx-auto w-full rounded-[2rem] sm:rounded-[3rem] overflow-visible md:overflow-hidden md:aspect-video"
            style={{ 
              maxWidth: "900px",
              background: "#000000",
              border: "6px solid #1a1a1a",
              boxShadow: "0 0 60px rgba(255, 0, 0, 0.25), 0 0 100px rgba(255, 0, 0, 0.15)"
            }}
          >
            
            {/* Feature cards grid - 2 columns on mobile, 4 on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3 md:gap-0 p-4 sm:p-6 md:p-8 md:h-full"
              style={{ minHeight: 'auto' }}
            >
              {features.map((feature, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.15}>
                  <div 
                    className={`relative group flex flex-col items-center justify-start text-center p-4 sm:p-5 md:p-6 md:h-full
                      ${idx % 2 === 0 ? 'border-r border-white/10' : ''} 
                      ${idx < 2 ? 'border-b border-white/10' : ''}
                      md:border-b-0
                      ${idx < 3 ? 'md:border-r md:border-white/10' : 'md:border-r-0'}
                    `}
                  >
                    
                    {/* Image - scaled down on mobile, fixed height row so all images align */}
                    <div className="mb-4 sm:mb-5 md:mb-7 h-14 sm:h-16 md:h-20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="h-full w-auto object-contain scale-75 sm:scale-90 md:scale-100"
                        style={{ filter: "drop-shadow(0 0 8px rgba(202, 42, 49, 0.4))" }}
                      />
                    </div>
                    
                    {/* Title - fixed height row so all descriptions start on the same line */}
                    {feature.title && (
                      <h3 className="w-full text-[0.65rem] sm:text-xs md:text-sm font-bold mb-4 sm:mb-5 md:mb-6 tracking-wider px-1 sm:px-2 flex items-center justify-center md:h-12 lg:h-10" 
                        style={{ 
                          color: "#FFFFFF", 
                          fontFamily: "'Inter', sans-serif",
                          textTransform: "uppercase",
                          lineHeight: "1.7"
                        }}>
                        {feature.title}
                      </h3>
                    )}
                    
                    {/* Subtitle */}
                    {feature.subtitle && (
                      <p className="text-[0.6rem] sm:text-xs font-bold mb-2 sm:mb-3 tracking-wider uppercase"
                        style={{ 
                          color: "#CA2A31", 
                          fontFamily: "'Inter', sans-serif" 
                        }}>
                        {feature.subtitle}
                      </p>
                    )}
                    
                    {/* Description */}
                    {feature.description && (
                      <p className="text-[0.6rem] sm:text-xs md:text-xs px-1 sm:px-2" 
                        style={{ 
                          color: "#FFFFFF", 
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: "2",
                          letterSpacing: "0.02em",
                          opacity: 0.7
                        }}>
                        {feature.description}
                      </p>
                    )}
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-0.5 transition-all duration-300 group-hover:w-16 sm:group-hover:w-20"
                      style={{
                        background: "#CA2A31"
                      }} />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
          
          {/* Left red glow */}
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-2 h-64 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, #CA2A31, transparent)",
              boxShadow: "0 0 40px #CA2A31",
              animation: "pulse 3s ease-in-out infinite"
            }} />
          
          {/* Right red glow */}
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-2 h-64 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, #CA2A31, transparent)",
              boxShadow: "0 0 40px #CA2A31",
              animation: "pulse 3s ease-in-out infinite 1.5s"
            }} />
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={0.6}>
          <div className="text-center">
            <Link
              to="/about/why-kustom-koats"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 group"
              style={{ 
                background: "#CA2A31",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 0 30px rgba(255, 0, 0, 0.5)"
              }}
            >
              DISCOVER MORE
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Add animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translateY(-50%) scaleY(1); }
          50% { opacity: 1; transform: translateY(-50%) scaleY(1.1); }
        }
      `}</style>
    </section>
  )
}
