import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Package, Tag, ShoppingBag, Users,
  Store, Menu, X, ChevronRight, Handshake,
  BarChart2, FileText
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/admin',            label: 'Dashboard',   icon: BarChart2,    exact: true },
  { path: '/admin/products',   label: 'Products',    icon: Package },
  { path: '/admin/categories', label: 'Categories',  icon: Tag },
  { path: '/admin/orders',     label: 'Orders',      icon: ShoppingBag },
  { path: '/admin/customers',  label: 'Customers',   icon: Users },
  { path: '/admin/wholesale',  label: 'Wholesale',   icon: Handshake },
  { path: '/admin/blog',       label: 'Blog',        icon: FileText },
]

export default function KKAdminLayout({ children }) {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentLabel = NAV_ITEMS.find(n =>
    n.exact ? pathname === n.path : pathname === n.path || pathname.startsWith(n.path + '/')
  )?.label || 'Admin'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F5F5' }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{
          width: 240,
          flexShrink: 0,
          background: '#111111',
          borderRight: '1px solid #222222',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #222222' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6,
                background: '#CA2A31',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem', fontFamily: "'Rajdhani', sans-serif" }}>K</span>
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em' }}>
                  KUSTOM KOATS
                </div>
                <div style={{ color: '#666666', fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Admin Panel
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
              const active = exact ? pathname === path : pathname === path || pathname.startsWith(path + '/')
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    background: active ? 'rgba(255,0,0,0.12)' : 'transparent',
                    borderLeft: `2px solid ${active ? '#CA2A31' : 'transparent'}`,
                    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon size={16} style={{ color: active ? '#CA2A31' : 'currentColor', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400, flex: 1 }}>
                    {label}
                  </span>
                  {active && <ChevronRight size={12} style={{ color: '#CA2A31' }} />}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 8px', borderTop: '1px solid #222222' }}>
            <Link
              to="/"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 6, textDecoration: 'none',
                color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem',
                fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
            >
              <Store size={16} /> View Website
            </Link>
          </div>
        </aside>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 56, flexShrink: 0,
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px',
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ color: '#666666', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{ color: '#000000', fontWeight: 600, fontSize: '0.9375rem', fontFamily: "'Inter', sans-serif" }}>
            {currentLabel}
          </span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F5F5F5' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
