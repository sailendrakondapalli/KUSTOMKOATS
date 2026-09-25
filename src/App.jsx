import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import IntroAnimation from './components/IntroAnimation'
import IntroVideo from './components/IntroVideo'
import AnimatedRoutes from './components/AnimatedRoutes'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useWishlistStore } from './store/wishlistStore'
import { LanguageProvider } from './context/LanguageContext'

// Admin pages (loaded separately — no Navbar/Footer)
const AdminProductsPage  = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminOrdersPage    = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminCustomersPage  = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminWholesalePage  = lazy(() => import('./pages/admin/AdminWholesalePage'))
const AdminBlogPage       = lazy(() => import('./pages/admin/AdminBlogPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: '#CA2A31', borderTopColor: 'transparent' }} />
  </div>
)

const AdminLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111' }}>
    <div className="w-8 h-8 rounded-full border-4 border-[#CA2A31] border-t-transparent animate-spin" />
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Don't scroll-to-top on admin pages
    if (!pathname.startsWith('/admin')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [pathname])
  return null
}

export default function App() {
  const { initialize, user } = useAuthStore()
  const { loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => { initialize() }, [])

  useEffect(() => {
    if (user) {
      loadCart(user.id)
      loadWishlist(user.id)
    } else {
      loadCart(null)
    }
  }, [user])

  const handleIntroComplete = () => {
    setTimeout(() => setShowIntro(false), 500)
  }

  const toastOptions = {
    duration: 3000,
    style: {
      background: '#FFFFFF',
      color: '#000000',
      border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 18px',
      maxWidth: '400px',
      fontFamily: 'Inter, sans-serif',
    },
    success: {
      style: {
        background: '#FFFFFF',
        color: '#16A34A',
        border: '1px solid rgba(22,163,74,0.2)',
      },
      iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' },
    },
    error: {
      style: {
        background: '#FFFFFF',
        color: '#DC2626',
        border: '1px solid rgba(220,38,38,0.2)',
      },
      iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
    },
  }

  return (
    <LanguageProvider>
      <HelmetProvider>
        {/* Intro — only on storefront */}
        <IntroVideo />
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ── ADMIN ROUTES — full-screen, no Navbar/Footer ── */}
            <Route path="/admin" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminProductsPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin/products" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminProductsPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin/orders" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminOrdersPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin/categories" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminCategoriesPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin/customers" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminCustomersPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin/wholesale" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminWholesalePage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/admin/blog" element={
              <ErrorBoundary>
                <Suspense fallback={<AdminLoader />}>
                  <AdminBlogPage />
                </Suspense>
              </ErrorBoundary>
            } />

            {/* ── STOREFRONT ROUTES — Navbar + Footer ── */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
                <Navbar />
                <main className="flex-1">
                  <AnimatedRoutes />
                </main>
                <Footer />
              </div>
            } />
          </Routes>

          <Toaster position="top-center" toastOptions={toastOptions} />
        </BrowserRouter>
      </HelmetProvider>
    </LanguageProvider>
  )
}
