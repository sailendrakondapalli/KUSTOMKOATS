import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Different animation variants for different pages
const slideVariants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -100,
  }
}

const fadeVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  }
}

const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 1.1,
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.4
}

// Choose animation based on page
const getPageVariants = (pathname) => {
  if (pathname === '/') return scaleVariants
  if (pathname.includes('/products') || pathname.includes('/events')) return slideVariants
  return fadeVariants
}

export default function PageTransition({ children }) {
  const location = useLocation()
  const variants = getPageVariants(location.pathname)
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={pageTransition}
      className="w-full"
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
