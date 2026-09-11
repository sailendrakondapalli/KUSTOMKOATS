import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import IntroAnimation from './components/IntroAnimation'
import AnimatedRoutes from './components/AnimatedRoutes'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useWishlistStore } from './store/wishlistStore'
import { LanguageProvider } from './context/LanguageContext'


const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "#000000" }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: "#DC0000", borderTopColor: "transparent" }} />
  </div>
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { 
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

export default function App() {
  const { initialize, user } = useAuthStore()
  const { loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()
  const [showIntro, setShowIntro] = useState(true)
  const [introComplete, setIntroComplete] = useState(false)

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
    setIntroComplete(true)
    setTimeout(() => setShowIntro(false), 500)
  }

  return (
    <LanguageProvider>
    <HelmetProvider>
      {/* Intro Animation */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Storefront routes */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col" style={{ background: "#000000" }}>
              <Navbar />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          } />
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid rgba(220, 0, 0, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              padding: '14px 20px',
              maxWidth: '420px',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              style: {
                background: '#1A1A1A',
                color: '#2ECC71',
                border: '1px solid rgba(46, 204, 113, 0.3)',
              },
              iconTheme: { primary: '#2ECC71', secondary: '#000' },
            },
            error: {
              style: {
                background: '#1A1A1A',
                color: '#DC0000',
                border: '1px solid rgba(220, 0, 0, 0.3)',
              },
              iconTheme: { primary: '#DC0000', secondary: '#000' },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
    </LanguageProvider>
  )
}
