import { createContext, useContext } from "react"

// English-only - language switching removed
const t = {
  home: "HOME",
  allProducts: "ALL PACKAGES",
  collections: "PACKAGES",
  contactUs: "CONTACT US",
  login: "Login",
  search: "Search...",
  seeAllResults: (q) => `See all results for "${q}"`,
  switchToAdmin: "Switch to Admin",
  switchToUser: "Switch to User",
  profile: "Profile",
  myOrders: "My Bookings",
  wishlist: "Wishlist",
  logout: "Logout",
  langToggle: "EN",

  // Hero
  heroSubtitle: "Professional Horse Riding Academy",
  heroHeading1: "Royal Hoof",
  heroHeading2: "Horse Riding Academy",
  heroDesc: "Professional horse riding lessons for all ages at GIRI FARMS, Nallambakkam, Tamil Nadu.",
  shopCollection: "VIEW PACKAGES",
  viewAll: "VIEW ALL",

  // Sections
  ourCollections: "Our Packages",
  whyChoose: "Why Choose Royal Hoof?",
  bestsellers: "Popular Packages",
  bestsellersSub: "Most Booked",
  newArrivals: "New Events",
  newArrivalsSub: "Upcoming",
  viewAllLink: "View All",

  // Features
  feat1Title: "CERTIFIED TRAINERS",
  feat1Sub: "Professional & Experienced",
  feat2Title: "ALL AGES WELCOME",
  feat3Title: "SAFE ENVIRONMENT",
  feat4Title: "FLEXIBLE TIMING",

  // Product / package card
  addToCart: "Book Now",
  goToCart: "View Booking",
  outOfStock: "Fully Booked",
  certified: "Certified",
  explore: "EXPLORE",
  inStock: "Available",

  // Footer
  footerTagline: "Professional horse riding lessons for adults & kids at GIRI FARMS, Nallambakkam, Tamil Nadu.",
  footerCollections: "Packages",
  footerQuickLinks: "Quick Links",
  footerHelp: "Help",
  footerShop: "Packages",
  footerAccount: "My Account",
  footerCart: "Enquiry",
  footerContact: "Contact Us",
  footerShipping: "Booking Policy",
  footerRefund: "Refund Policy",
  footerPrivacy: "Privacy Policy",
  footerCopy: "- 2026 Royal Hoof Horse Riding Academy. All rights reserved.",

  // Checkout / orders
  checkout: "Enquiry",
  buyNow: "Book Now",
  deliveryAddress: "Your Details",
  addNew: "Add New",
  continuePayment: "Continue ?",
  orderSummary: "Booking Summary",
  subtotal: "Subtotal",
  shipping: "Charges",
  total: "Total",
  enterPromo: "Enter promo code",
  apply: "Apply",
  viewOrders: "View Bookings",
  continueShopping: "Continue Browsing",
  orderPlaced: "Enquiry Submitted!",
  orderPending: "We will get back to you shortly.",
  orderNotify: "Our team will contact you to confirm your booking.",
}

const LanguageContext = createContext({ t, lang: "en", toggleLang: () => {} })

export function LanguageProvider({ children }) {
  return (
    <LanguageContext.Provider value={{ t, lang: "en", toggleLang: () => {} }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
