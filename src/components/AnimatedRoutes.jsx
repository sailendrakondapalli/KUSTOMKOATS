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
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage'))
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

// Shop pages
const XtremeKolorzPage = lazy(() => import('../pages/shop/XtremeKolorzPage'))
const XtremeWrapPage = lazy(() => import('../pages/shop/XtremeWrapPage'))
const AccessoriesPage = lazy(() => import('../pages/shop/AccessoriesPage'))
const ShopPage = lazy(() => import('../pages/shop/ShopPage'))

// Admin pages are handled in App.jsx directly (full-screen layout, no Navbar/Footer)

// Kustom Kulture pages
const KultureJournalPage = lazy(() => import('../pages/kulture/KultureJournalPage'))
const KultureNewsPage = lazy(() => import('../pages/kulture/KultureNewsPage'))
const KultureEventsPage = lazy(() => import('../pages/kulture/KultureEventsPage'))
const KultureProjectsPage = lazy(() => import('../pages/kulture/KultureProjectsPage'))
const KultureHowToPage = lazy(() => import('../pages/kulture/KultureHowToPage'))
const KultureGaragesPage = lazy(() => import('../pages/kulture/KultureGaragesPage'))
const KultureDetailingPage = lazy(() => import('../pages/kulture/KultureDetailingPage'))
const KultureAccessoriesPage = lazy(() => import('../pages/kulture/KultureAccessoriesPage'))
const KultureUniversityPage = lazy(() => import('../pages/kulture/KultureUniversityPage'))

// Wholesale pages
const WhyPartnerPage = lazy(() => import('../pages/wholesale/WhyPartnerPage'))
const DealerPage = lazy(() => import('../pages/wholesale/DealerPage'))
const DistributorPage = lazy(() => import('../pages/wholesale/DistributorPage'))
const WholesalerPage = lazy(() => import('../pages/wholesale/WholesalerPage'))
const ApplicationPage = lazy(() => import('../pages/wholesale/ApplicationPage'))

// About pages
const OurStoryPage = lazy(() => import('../pages/about/OurStoryPage'))
const OurPhilosophyPage = lazy(() => import('../pages/about/OurPhilosophyPage'))
const TechnologyPage = lazy(() => import('../pages/about/TechnologyPage'))
const WhyKustomKoatsPage = lazy(() => import('../pages/about/WhyKustomKoatsPage'))

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
        {/* Home */}
        <Route path="/" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <HomePage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        
        {/* Shop Routes */}
        <Route path="/shop" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ShopPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/shop/xtreme-kolorz" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <XtremeKolorzPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/shop/xtreme-wrap" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <XtremeWrapPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/shop/accessories" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <AccessoriesPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/shop/wholesale" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <WholesalePage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        
        {/* Kustom Kulture Routes */}
        <Route path="/kulture/journal" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureJournalPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/news" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureNewsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/events" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureEventsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/projects" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureProjectsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/how-to" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureHowToPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/garages" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureGaragesPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/detailing" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureDetailingPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/accessories" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureAccessoriesPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/kulture/university" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <KultureUniversityPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        
        {/* Wholesale Routes */}
        <Route path="/wholesale/why-partner" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <WhyPartnerPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/wholesale/dealer" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <DealerPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/wholesale/distributor" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <DistributorPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/wholesale/wholesaler" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <WholesalerPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/wholesale/application" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ApplicationPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        
        {/* About Routes */}
        <Route path="/about/story" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <OurStoryPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/about/philosophy" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <OurPhilosophyPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/about/technology" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <TechnologyPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        <Route path="/about/why-kustom-koats" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <WhyKustomKoatsPage />
              </Suspense>
            </ErrorBoundary>
          </PageTransition>
        } />
        
        {/* Existing Routes */}
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
        
        {/* Admin Routes are defined in App.jsx (full-screen, no Navbar/Footer) */}
        
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
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <CheckoutPage />
              </Suspense>
            </ErrorBoundary>
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
        <Route path="/order-success" element={
          <PageTransition>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <OrderSuccessPage />
              </Suspense>
            </ErrorBoundary>
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
