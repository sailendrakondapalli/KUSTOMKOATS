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
              Premium automotive grade pearls, vinyl wraps, and accessories for professional custom finishes. Specializing in Xtreme Kolorz pearls, Xtreme Wrap vinyl films, and professional automotive accessories.
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

          {/* Product Categories */}
          <div>
            <h4 className="text-sm font-bold mb-4 tracking-wider uppercase" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Product Categories</h4>
            <ul className="space-y-3">
              {[
                { to: "/shop/xtreme-kolorz", label: "Xtreme Kolorz" },
                { to: "/shop/xtreme-wrap", label: "Xtreme Wrap" },
                { to: "/shop/accessories", label: "Accessories" },
                { to: "/shop/wholesale", label: "Wholesale" }
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

        {/* Payment Methods */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
            WE ACCEPT
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Visa */}
            <div className="h-8 px-3 flex items-center justify-center rounded border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
              <svg width="40" height="13" viewBox="0 0 40 13" fill="none">
                <path d="M15.2 0.8H12.8L11 10.4H13.4L15.2 0.8Z" fill="#1A1F71"/>
                <path d="M21.6 1C21.1 0.8 20.2 0.6 19.1 0.6C16.7 0.6 15 1.8 15 3.6C15 4.9 16.3 5.6 17.3 6C18.3 6.4 18.7 6.7 18.7 7.1C18.7 7.7 18 8 17.3 8C16.3 8 15.8 7.9 15 7.5L14.6 7.3L14.2 9.6C14.8 9.9 15.9 10.1 17 10.1C19.6 10.1 21.3 8.9 21.3 7C21.3 6 20.6 5.3 19.1 4.7C18.2 4.3 17.7 4 17.7 3.6C17.7 3.2 18.2 2.8 19.2 2.8C20 2.8 20.7 3 21.2 3.2L21.5 3.4L21.9 1.2C21.6 1.1 21.1 1 21.6 1Z" fill="#1A1F71"/>
                <path d="M28.5 0.8H26.7C26.1 0.8 25.7 1 25.4 1.6L21.6 10.4H24.2L24.7 9H27.9L28.2 10.4H30.5L28.5 0.8ZM25.4 7.2L26.6 3.9L27.3 7.2H25.4Z" fill="#1A1F71"/>
                <path d="M9.7 0.8L7.2 7.7L6.9 6.2C6.5 4.8 5.2 3.3 3.8 2.5L6 10.4H8.7L12.5 0.8H9.7Z" fill="#1A1F71"/>
                <path d="M5.5 0.8H1L1 1C4.2 1.8 6.6 3.9 7.5 6.7L6.6 1.7C6.5 1.1 6.1 0.9 5.5 0.8Z" fill="#F7981D"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="h-8 px-3 flex items-center justify-center rounded border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <circle cx="12" cy="10" r="8" fill="#EB001B"/>
                <circle cx="20" cy="10" r="8" fill="#F79E1B"/>
                <path d="M16 4.5C17.3 5.6 18.1 7.2 18.1 9C18.1 10.8 17.3 12.4 16 13.5C14.7 12.4 13.9 10.8 13.9 9C13.9 7.2 14.7 5.6 16 4.5Z" fill="#FF5F00"/>
              </svg>
            </div>
            {/* American Express */}
            <div className="h-8 px-3 flex items-center justify-center rounded border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <rect width="32" height="20" rx="2" fill="#006FCF"/>
                <path d="M8 8H10L11 10L12 8H14V14H12V10L11 12L10 10V14H8V8Z" fill="white"/>
                <path d="M18 8H22V10H20V11H22V13H20V14H22V16H18V8Z" fill="white"/>
                <path d="M15 10V8H17V10H15ZM15 12V14H17V16H15V14H17V12H15Z" fill="white"/>
              </svg>
            </div>
            {/* PayPal */}
            <div className="h-8 px-3 flex items-center justify-center rounded border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <path d="M11.5 4H15.5C17.5 4 19 5.5 19 7.5C19 9.5 17.5 11 15.5 11H13.5L12.5 16H10L11.5 4Z" fill="#003087"/>
                <path d="M13.5 11H15.5C17.5 11 19 12.5 19 14.5C19 16.5 17.5 18 15.5 18H13.5L12.5 16H10L11.5 11H13.5Z" fill="#009CDE"/>
              </svg>
            </div>
            {/* RuPay */}
            <div className="h-8 px-3 flex items-center justify-center rounded border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                <path d="M8 5H12C14 5 15 6 15 8C15 10 14 11 12 11H10L9 15H7L8 5Z" fill="#097939"/>
                <path d="M16 5H18L17 15H15L16 5Z" fill="#097939"/>
                <path d="M19 10C19 7 21 5 24 5C27 5 29 7 29 10C29 13 27 15 24 15C21 15 19 13 19 10Z" fill="#097939"/>
              </svg>
            </div>
            {/* UPI */}
            <div className="h-8 px-3 flex items-center justify-center rounded border text-xs font-bold" style={{ background: "#FFFFFF", borderColor: "#E5E5E5", color: "#097939" }}>
              UPI
            </div>
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", marginBottom: "24px" }} />

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
