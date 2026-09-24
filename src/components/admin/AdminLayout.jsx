import { useState, useRef, useEffect } from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart2, ShoppingBag, BarChart3, Users, Bell, Menu, X,
  LogOut, ChevronRight, AlertTriangle, Store, Calendar, MessageSquare,
  Image, Gift, FileText
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useAdminStore } from "../../store/adminStore"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

// Royal Hoof dark theme palette (legacy - kept for reference)
// bg: #1A1714  sidebar: #2C2C2C  card: #5B1E28  accent: #B8955A  text: #F3EBDD

const NAV = [
  { path: "/admin", label: "Dashboard", icon: BarChart2 },
  { path: "/admin/events", label: "Events", icon: Calendar },
  { path: "/admin/packages", label: "Packages", icon: Gift },
  { path: "/admin/gallery", label: "Gallery", icon: Image },
  { path: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { path: "/admin/testimonials", label: "Testimonials", icon: Users },
  { path: "/admin/about", label: "About Section", icon: FileText },
  { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

function Sidebar({ pathname, onSignOut, onNavClick, user, pendingCount }) {
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Admin"
  const initials = displayName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 248, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ background: "#2C2C2C", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      className="flex-shrink-0 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="px-5 py-5">
        <Link to="/admin" onClick={onNavClick} className="flex items-center gap-3 select-none">
          <div style={{
            width: 36, height: 36, borderRadius: 4,
            background: "rgba(216,199,174,0.12)",
            border: "1px solid rgba(216,199,174,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.1rem"
          }}>
            🐴
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 700, color: "#F3EBDD", letterSpacing: "0.06em", display: "block" }}>
              ROYALHOOF
            </span>
            <span style={{ fontSize: "0.625rem", letterSpacing: "0.18em", color: "#B8955A", textTransform: "uppercase", display: "block" }}>
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = pathname === path || (path !== "/admin" && pathname.startsWith(path))
          const badge = label === "Enquiries" && pendingCount > 0 ? pendingCount : null
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavClick}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px",
                borderRadius: "5px",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                background: active ? "rgba(216,199,174,0.12)" : "transparent",
                borderLeft: active ? "2px solid #B8955A" : "2px solid transparent",
                paddingLeft: active ? "10px" : "10px",
                color: active ? "#F3EBDD" : "rgba(243,235,221,0.55)",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
            >
              <Icon size={15} style={{ color: active ? "#B8955A" : "currentColor", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400 }}>{label}</span>
              {badge && (
                <span style={{ background: "#B8955A", color: "#5B1E28", fontSize: "0.625rem", fontWeight: 700, padding: "2px 6px", borderRadius: "9999px", minWidth: 18, textAlign: "center" }}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {active && <ChevronRight size={12} style={{ color: "#B8955A", marginLeft: "auto" }} />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px" }}>
        <Link
          to="/"
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "5px", textDecoration: "none",
            color: "rgba(243,235,221,0.55)", fontSize: "0.8125rem", fontFamily: "'Inter', sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Store size={15} /> View Website
        </Link>
        <button
          onClick={onSignOut}
          style={{
            display: "flex", alignItems: "center", gap: "10px", width: "100%",
            padding: "10px 12px", borderRadius: "5px", border: "none", cursor: "pointer",
            background: "transparent", color: "rgba(243,235,221,0.55)", fontSize: "0.8125rem",
            fontFamily: "'Inter', sans-serif", transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(243,235,221,0.55)" }}
        >
          <LogOut size={15} /> Logout
        </button>

        {/* Admin user card */}
        <div style={{
          marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
          background: "rgba(255,255,255,0.03)", borderRadius: "5px",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #B8955A, #9A8870)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "#5B1E28", fontWeight: 700, fontSize: "0.75rem",
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#F3EBDD", fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>{displayName}</p>
            <span style={{ fontSize: "0.5625rem", fontWeight: 700, padding: "2px 6px", borderRadius: "9999px", background: "rgba(216,199,174,0.15)", color: "#B8955A", display: "inline-block", letterSpacing: "0.08em" }}>
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 1024) setSidebarOpen(false) }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const [notifOpen, setNotifOpen] = useState(false)
  const { pathname } = useLocation()
  const { signOut, user } = useAuthStore()
  const { notifications, clearNotification, addNotification, orders, products, loadOrders, loadProducts, computeStats } = useAdminStore()
  const navigate = useNavigate()
  const notifRef = useRef(null)

  useEffect(() => { loadOrders(); loadProducts() }, [])

  const pendingCount = orders.filter(o => o.status === "new" || o.payment_status === "pending").length

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/") }

  // Realtime new-order notifications
  useEffect(() => {
    const channel = supabase
      .channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const order = payload.new
        addNotification(`New order from ${order.name || "a customer"}`, "info")
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const currentPageLabel = NAV.find(n => pathname === n.path || (n.path !== "/admin" && pathname.startsWith(n.path)))?.label || "Admin Panel"
  const initials = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "A")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#1A1714" }}>
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <Sidebar
            pathname={pathname}
            onSignOut={handleSignOut}
            onNavClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false) }}
            user={user}
            pendingCount={pendingCount}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header style={{
          background: "#2C2C2C",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{ color: "#B8955A", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <Menu size={20} />
              </button>
              <span style={{ color: "#F3EBDD", fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                className="hidden sm:block">
                {currentPageLabel}
              </span>
            </div>

            {/* Brand in center on mobile */}
            <span style={{ fontFamily: "'Cormorant Garamond', serif", color: "#B8955A", fontSize: "1rem", fontWeight: 600, letterSpacing: "0.06em" }}
              className="sm:hidden">
              ROYALHOOF
            </span>

            <div className="flex items-center gap-2">
              {/* Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  style={{ color: "rgba(243,235,221,0.6)", background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "4px", position: "relative" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span style={{
                      position: "absolute", top: 2, right: 2,
                      background: "#ef4444", color: "#fff", fontSize: "0.5625rem",
                      borderRadius: "9999px", width: 14, height: 14,
                      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                    }}>
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: "absolute", right: 0, top: "100%", marginTop: 8,
                        width: 280, background: "#2C2C2C",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        zIndex: 100, overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#F3EBDD", fontSize: "0.875rem", fontWeight: 600 }}>Notifications</span>
                        <button onClick={() => setNotifOpen(false)} style={{ color: "rgba(243,235,221,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ maxHeight: 240, overflowY: "auto" }}>
                        {notifications.length === 0
                          ? <p style={{ color: "rgba(243,235,221,0.3)", fontSize: "0.75rem", textAlign: "center", padding: "24px" }}>No notifications</p>
                          : notifications.map(n => (
                            <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
                              <AlertTriangle size={13} style={{ color: "#B8955A", marginTop: 2 }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ color: "rgba(243,235,221,0.8)", fontSize: "0.75rem" }}>{n.msg}</p>
                                <p style={{ color: "rgba(243,235,221,0.3)", fontSize: "0.6875rem", marginTop: 2 }}>{new Date(n.time).toLocaleTimeString()}</p>
                              </div>
                              <button onClick={() => clearNotification(n.id)} style={{ color: "rgba(243,235,221,0.3)", background: "none", border: "none", cursor: "pointer" }}>
                                <X size={11} />
                              </button>
                            </div>
                          ))
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg, #B8955A, #9A8870)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#5B1E28", fontWeight: 700, fontSize: "0.6875rem",
                  border: "2px solid rgba(216,199,174,0.3)",
                  flexShrink: 0, cursor: "default",
                }}>
                  {initials}
                </div>
                <span style={{ color: "rgba(243,235,221,0.6)", fontSize: "0.75rem", fontFamily: "'Inter', sans-serif" }}
                  className="hidden sm:block">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: "#1A1714", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
