import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ScrollReveal from './ScrollReveal'

const PX = "px-6 lg:px-12 xl:px-20"

export default function WhyKustomKoatsNeon() {
  const features = [
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M25 15L30 40L40 35L50 40L55 15M40 35V55M30 55H50M25 65H55M20 70H60" 
            stroke="url(#paint0_linear)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="paint0_linear" x1="25" y1="15" x2="55" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF00FF"/>
              <stop offset="1" stopColor="#00FFFF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "PREMIUM AUTOMOTIVE FINISHES",
      subtitle: "EXTREME COLOR EFFECTS",
      description: "Designed - grade coatings engineered by enthusiasts, crafted for the highest quality automotive and industrial results."
    },
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 20C40 20 30 25 30 35C30 45 40 50 40 60C40 50 50 45 50 35C50 25 40 20 40 20Z" 
            stroke="url(#paint1_linear)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="40" cy="40" r="25" stroke="url(#paint1_linear)" strokeWidth="2" strokeDasharray="4 4"/>
          <defs>
            <linearGradient id="paint1_linear" x1="30" y1="20" x2="50" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF00FF"/>
              <stop offset="1" stopColor="#00FFFF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "BUILD TO LAST",
      subtitle: "",
      description: "Durable, high - performance coatings that withstand the test of time, ensuring long-lasting color brilliance."
    },
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M40 15L25 20L25 35C25 48 32 55 40 58C48 55 55 48 55 35L55 20L40 15Z" 
            stroke="url(#paint2_linear)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M33 35L37 40L47 30" stroke="url(#paint2_linear)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="paint2_linear" x1="25" y1="15" x2="55" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6"/>
              <stop offset="1" stopColor="#EC4899"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "TRUSTED FORMULAS",
      subtitle: "WORLDWIDE",
      description: "Homemade, caring and safe formulation that ensures bright colors with no unforgettable risks."
    },
    {
      icon: (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="22" stroke="url(#paint3_linear)" strokeWidth="2.5"/>
          <path d="M25 40C25 40 30 30 40 30C50 30 55 40 55 40C55 40 50 50 40 50C30 50 25 40 25 40Z" 
            stroke="url(#paint3_linear)" strokeWidth="2.5" fill="none"/>
          <circle cx="40" cy="40" r="5" fill="url(#paint3_linear)"/>
          <path d="M20 35L25 40L20 45M60 35L55 40L60 45" stroke="url(#paint3_linear)" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="paint3_linear" x1="20" y1="30" x2="60" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00FFFF"/>
              <stop offset="1" stopColor="#0080FF"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "",
      subtitle: "",
      description: ""
    }
  ]

  return (
    <section className="relative w-full py-24 overflow-hidden" 
      style={{ 
        background: "linear-gradient(135deg, #000000 0%, #1a0033 50%, #000033 100%)",
      }}>
      
      {/* Neon glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #FF00FF 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #00FFFF 0%, transparent 70%)" }} />
      
      <div className={`relative max-w-7xl mx-auto ${PX}`}>
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs font-bold mb-4 tracking-[0.3em] uppercase" 
              style={{ color: "#FFFFFF", fontFamily: "'Inter', sans-serif", opacity: 0.7 }}>
              WHY KUSTOM KOATS ?
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
              style={{ 
                fontFamily: "'Rajdhani', sans-serif", 
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
              PREMIUM FINISHES. MAXIMUM IMPACT.
            </h2>
            <p className="text-sm md:text-base max-w-3xl mx-auto leading-relaxed" 
              style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              At Kustom Koats, we don't just make colors - we create experiences.
              <br />
              Engineered for performance. Design to turn heads.
            </p>
          </div>
        </ScrollReveal>

        {/* iPhone mockup container */}
        <div className="relative max-w-5xl mx-auto mb-12">
          {/* iPhone frame */}
          <div className="relative mx-auto rounded-[3rem] overflow-hidden"
            style={{ 
              maxWidth: "900px",
              aspectRatio: "16/9",
              background: "#000000",
              border: "8px solid #1a1a1a",
              boxShadow: "0 0 80px rgba(255, 0, 255, 0.3), 0 0 120px rgba(0, 255, 255, 0.2)"
            }}>
            
            {/* Feature cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 h-full p-4 md:p-8">
              {features.map((feature, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.15}>
                  <div className="relative group h-full flex flex-col items-center justify-start text-center p-4 md:p-6"
                    style={{
                      borderRight: idx < 3 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                      borderBottom: idx < 2 ? "1px solid rgba(255, 255, 255, 0.1)" : "none"
                    }}>
                    
                    {/* Icon */}
                    <div className="mb-4 md:mb-6 transition-transform duration-500 group-hover:scale-110">
                      {feature.icon}
                    </div>
                    
                    {/* Title */}
                    {feature.title && (
                      <h3 className="text-xs md:text-sm font-bold mb-1 tracking-wider" 
                        style={{ 
                          color: "#FFFFFF", 
                          fontFamily: "'Inter', sans-serif",
                          textTransform: "uppercase",
                          lineHeight: "1.3"
                        }}>
                        {feature.title}
                      </h3>
                    )}
                    
                    {/* Subtitle */}
                    {feature.subtitle && (
                      <p className="text-xs font-bold mb-3 tracking-wider uppercase"
                        style={{ 
                          color: "#FF00FF", 
                          fontFamily: "'Inter', sans-serif" 
                        }}>
                        {feature.subtitle}
                      </p>
                    )}
                    
                    {/* Description */}
                    {feature.description && (
                      <p className="text-[10px] md:text-xs leading-relaxed" 
                        style={{ 
                          color: "#AAAAAA", 
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: "1.5"
                        }}>
                        {feature.description}
                      </p>
                    )}
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 transition-all duration-300 group-hover:w-20"
                      style={{
                        background: "linear-gradient(90deg, transparent, #FF00FF, #00FFFF, transparent)"
                      }} />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
          
          {/* Left neon glow */}
          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-2 h-64 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, #FF00FF, transparent)",
              boxShadow: "0 0 40px #FF00FF",
              animation: "pulse 3s ease-in-out infinite"
            }} />
          
          {/* Right neon glow */}
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-2 h-64 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, #00FFFF, transparent)",
              boxShadow: "0 0 40px #00FFFF",
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
                background: "linear-gradient(135deg, #FF00FF 0%, #00FFFF 100%)",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 0 30px rgba(255, 0, 255, 0.5)"
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
