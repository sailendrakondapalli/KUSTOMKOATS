import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import { CONTACT_INFO } from '../config/contact'

export default function Footer() {
  return (
    <footer style={{ background: "#FFFFFF", borderTop: "1px solid rgba(0, 0, 0, 0.1)" }} className="mt-20">
      <div className="w-full px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
              KUSTOM KOATS
            </h3>
            <p className="text-sm font-medium mb-4 tracking-wider uppercase" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              {CONTACT_INFO.company.tagline}
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
              Premium automotive grade pearls for professional finishes. Over 300+ colors including Solid Pearls, Interference Pearls, Carbon Pearls, OEM+ Pearls, Special Effect Pearls, and Chroma Pearls.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 text-sm" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>
              <div className="flex items-start gap-3">
                <MapPin size={15} style={{ color: "#FF0000", marginTop: "2px" }} className="flex-shrink-0" /> 
                <div>
                  <p>{CONTACT_INFO.company.fullAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} style={{ color: "#FF0000" }} /> 
                {CONTACT_INFO.phone}
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} style={{ color: "#FF0000" }} /> 
                {CONTACT_INFO.email.info}
              </div>
              <div className="flex items-center gap-3">
                <Globe size={15} style={{ color: "#FF0000" }} /> 
                {CONTACT_INFO.website}
              </div>
            </div>
          </div>

          {/* Pearl Categories */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wider uppercase" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Pearl Categories</h4>
            <ul className="space-y-3">
              {[
                "Solid Pearls",
                "Interference Pearls", 
                "Carbon Pearls",
                "OEM+ Pearls",
                "Special Effect",
                "Chroma Pearls"
              ].map(category => (
                <li key={category}>
                  <Link to="/colors" className="text-sm transition-colors duration-300" 
                    style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#FF0000"}
                    onMouseLeave={e => e.currentTarget.style.color = "#333333"}>
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wider uppercase" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/colors", label: "Colors" },
                { to: "/products", label: "Products" },
                { to: "/about", label: "About" },
                { to: "/partners", label: "Partners" },
                { to: "/faq", label: "FAQ" },
                { to: "/contact", label: "Contact" },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm transition-colors duration-300" 
                    style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#FF0000"}
                    onMouseLeave={e => e.currentTarget.style.color = "#333333"}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", margin: "40px 0" }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
          <span>© {new Date().getFullYear()} {CONTACT_INFO.company.parent}. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-[#FF0000] transition-colors">Privacy Policy</Link>
            <Link to="/shipping-policy" className="hover:text-[#FF0000] transition-colors">Shipping</Link>
            <Link to="/refund-policy" className="hover:text-[#FF0000] transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
