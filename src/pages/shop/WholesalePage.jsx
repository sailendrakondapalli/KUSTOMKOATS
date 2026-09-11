import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function WholesalePage() {
  return (
    <>
      <Helmet>
        <title>Wholesale - Kustom Koats</title>
        <meta name="description" content="Wholesale pricing for dealers, distributors, and professionals" />
      </Helmet>

      <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
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
              WHOLESALE
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Special pricing for dealers, distributors, and wholesale partners
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <Link to="/wholesale/application" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold transition-all hover:scale-105"
              style={{ background: "#FF0000", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
              Apply for Wholesale Account
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
