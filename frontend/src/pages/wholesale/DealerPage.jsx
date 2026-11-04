import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function DealerPage() {
  return (
    <>
      <Helmet>
        <title>Become a Dealer - Kustom Koats</title>
        <meta name="description" content="Join our dealer network" />
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
              BECOME A DEALER
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: "#CCCCCC", fontFamily: "'Inter', sans-serif" }}>
              Join our dealer network
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <p className="text-lg mb-8" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              Content coming soon.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
