import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"
import { Search, ShoppingCart, Heart, User, Settings, Store } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useAdminStore } from "../store/adminStore"
import { useCartStore } from "../store/cartStore"
import { useWishlistStore } from "../store/wishlistStore"
import { isAdmin as checkIsAdmin } from "./AdminRoute"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuthStore()
  const { products, loadProducts } = useAdminStore()
  const { itemCount } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const userRef = useRef(null)
  const searchRef = useRef(null)
  const isAdmin = checkIsAdmin(user)
  const isOnAdminPanel = pathname.startsWith("/admin")

  useEffect(() => {
    if (!products.length) loadProducts()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        // Handle user menu if needed
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([])
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler) }
  }, [])

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.trim().length >= 2 && products.length) {
      const lower = q.toLowerCase()
      const matches = products.filter(p =>
        p.name?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower) ||
        (p.custom_id || "").toLowerCase().includes(lower)
      ).slice(0, 6)
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }

  const handleSearch = (e) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery(""); setSuggestions([])
      setMenuOpen(false)
    }
  }

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}`)
    setSearchQuery(""); setSuggestions([])
  }

  const closeAll = () => { 
    setMenuOpen(false)
  }

  const navStyle = {
    background: scrolled ? "#FFFFFF" : (pathname === "/" ? "rgba(255, 255, 255, 0.98)" : "#FFFFFF"),
    backdropFilter: scrolled || pathname === "/" ? "blur(20px)" : "none",
    boxShadow: scrolled ? "0 1px 0 rgba(0, 0, 0, 0.1)" : "none",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  }

  const iconStyle = "w-10 h-10 flex items-center justify-center text-black hover:text-[#FF0000] transition-colors duration-300"

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/colors", label: "Colors" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About" },
    { to: "/partners", label: "Partners" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" },
  ]

  // Mobile sidebar rendered via portal so it escapes ALL stacking contexts
  const mobileSidebar = menuOpen ? createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)" }}
      />
      {/* Sidebar panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "280px",
          background: "#FFFFFF",
          borderLeft: "1px solid rgba(0,0,0,0.15)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          zIndex: 100000,
        }}
      >
        {/* Sidebar header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}>
          <span style={{
            fontFamily: "'Rajdhani', 'Inter', sans-serif",
            fontSize: "1.125rem",
            fontWeight: 700,
            color: '#000000',
            letterSpacing: "0.08em",
          }}>
            KUSTOM KOATS
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ color: "#000000", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {navLinks.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "13px 24px",
                color: "#000000",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9375rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,0,0,0.05)"
                e.currentTarget.style.color = "#FF0000"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "#000000"
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin button inside sidebar */}
          {isAdmin && (
            <div style={{ padding: "20px 24px 0" }}>
              <Link
                to={isOnAdminPanel ? "/" : "/admin"}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  background: "#FF0000",
                  color: "#FFFFFF",
                  padding: "10px 16px",
                  borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {isOnAdminPanel ? "Store View" : "Admin Panel"}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <nav className="sticky top-0 w-full" style={{ ...navStyle, zIndex: 50 }}>
        {/* MAIN ROW */}
        <div className="w-full px-6 lg:px-12 xl:px-20 h-20 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0" onClick={closeAll}>
            <div className="block leading-tight">
              <div className="font-bold tracking-[0.08em] text-[1.25rem]" 
                style={{ 
                  fontFamily: "'Rajdhani', 'Inter', sans-serif",
                  color: '#000000',
                  letterSpacing: '0.08em'
                }}>
                KUSTOM KOATS
              </div>
              <div className="hidden sm:block text-[0.625rem] tracking-[0.12em] uppercase mt-0.5" 
                style={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: '#666666',
                  fontWeight: 500,
                  letterSpacing: '0.12em'
                }}>
                Automotive Grade Pearls
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isOnAdminPanel && (
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(item => (
                <Link key={item.to} to={item.to} onClick={closeAll}
                  className="px-5 h-10 flex items-center text-[0.875rem] font-medium tracking-wide text-black/80 hover:text-[#FF0000] transition-colors duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop Search */}
          <div ref={searchRef} className="hidden lg:block relative w-72 ml-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
              <input
                type="text" value={searchQuery} onChange={handleSearchChange}
                placeholder="Search colors..."
                className="w-full rounded-sm pl-11 pr-4 py-2.5 text-sm text-black placeholder-black/30 focus:outline-none transition-all duration-300"
                style={{
                  background: "#F8F8F8",
                  border: "1px solid rgba(0, 0, 0, 0.15)",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </form>
            {suggestions.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 rounded-sm z-50 overflow-hidden"
                style={{ 
                  background: "#FFFFFF", 
                  border: "1px solid rgba(0, 0, 0, 0.15)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)" 
                }}>
                {suggestions.map(p => (
                  <button key={p.id} onClick={() => handleSuggestionClick(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F8F8F8] transition-colors text-left">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm flex-shrink-0" 
                        onError={e => { e.target.style.display = "none" }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-sm font-medium truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{p.name}</p>
                      <p className="text-gray-600 text-xs">{p.category}</p>
                    </div>
                    <span className="text-[#FF0000] text-sm font-semibold flex-shrink-0">
                      {p.price?.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
            {!isOnAdminPanel && (
              <>
                <Link to="/wishlist" className={iconStyle} title="Wishlist">
                  <div className="relative">
                    <Heart size={20} />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF0000] text-white text-[0.625rem] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
                <Link to="/cart" className={iconStyle} title="Cart">
                  <div className="relative">
                    <ShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF0000] text-white text-[0.625rem] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link to={user ? "/profile" : "/login"} className={iconStyle} title={user ? "Profile" : "Login"}>
                  <User size={20} />
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to={isOnAdminPanel ? "/" : "/admin"}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-[0.6875rem] font-semibold rounded-sm transition-all tracking-wide uppercase"
                style={{ 
                  background: "#FF0000", 
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif" 
                }}>
                {isOnAdminPanel ? <><Store size={13} /> Store</> : <><Settings size={13} /> Admin</>}
              </Link>
            )}

            {/* Hamburger button */}
            <button 
              className="lg:hidden p-2 transition-colors"
              style={{ color: "#000000", background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar rendered at document.body level via portal */}
      {mobileSidebar}
    </>
  )
}
