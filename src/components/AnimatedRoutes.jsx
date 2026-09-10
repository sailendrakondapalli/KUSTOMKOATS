import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './ProtectedRoute'
import ErrorBoundary from './ErrorBoundary'
import PageTransition from './PageTransition'

// Lazy loaded pages
const HomePage = lazy(() => import('../pages/HomePage'))
const ColorsPage = lazy(() => import('../pages/ColorsPage'))
const ProductsPage = lazy(() => import('../pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const WishlistPage = lazy(() => import('../pages/WishlistPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const AuthCallbackPage = lazy(() => import('../pages/AuthCallbackPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))
const EnquiryPage = lazy(() => import('../pages/EnquiryPage'))
const EventsPage = lazy(() => import('../pages/EventsPage'))
const PolicyPage = lazy(() => import('../pages/PolicyPage'))
const PackagesPage = lazy(() => import('../pages/PackagesPage'))
const GalleryPage = lazy(() => import('../pages/GalleryPage'))
const TestimonialsPage = lazy(() => import('../pages/TestimonialsPage'))
const FAQPage = lazy(() => import('../pages/FAQPage'))

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "#000000" }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: "#FF0000", borderTopColor: "transparent" }} />
  </div>
)

export default function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <HomePage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/colors" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ColorsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/products" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ProductsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/products/:id" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ProductDetailPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/events" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <EventsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/packages" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <PackagesPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/gallery" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <GalleryPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/testimonials" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <TestimonialsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/faq" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <FAQPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/enquiry" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <EnquiryPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/contact" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ContactPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/cart" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <CartPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/checkout" element={
          <PageTransition>
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <CheckoutPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          </PageTransition>
        } />
        <Route path="/orders" element={
          <PageTransition>
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <OrdersPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          </PageTransition>
        } />
        <Route path="/wishlist" element={
          <PageTransition>
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <WishlistPage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          </PageTransition>
        } />
        <Route path="/profile" element={
          <PageTransition>
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          </PageTransition>
        } />
        <Route path="/auth/callback" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <AuthCallbackPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/refund-policy" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <PolicyPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/shipping-policy" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <PolicyPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/privacy-policy" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <PolicyPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  )
}