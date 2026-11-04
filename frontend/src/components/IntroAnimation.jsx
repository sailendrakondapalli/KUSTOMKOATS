import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroAnimation({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-complete after 3 seconds
    const timer = setTimeout(() => {
      handleComplete()
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => onComplete?.(), 500)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
        style={{ 
          background: '#000000'
        }}
        onClick={handleComplete}
      >
        <div className="relative flex flex-col items-center justify-center">
          {/* Animated red glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(220,0,0,0.4) 0%, transparent 70%)',
              width: '400px',
              height: '400px'
            }}
          />
          
          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-4" 
                style={{ 
                  fontFamily: "'Rajdhani', sans-serif",
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
              KUSTOM
            </h1>
            
            <motion.h2
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider"
              style={{ 
                fontFamily: "'Rajdhani', sans-serif",
                background: 'linear-gradient(90deg, #DC0000 0%, #FF1A1A 50%, #DC0000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
              KOATS
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-sm md:text-base tracking-[0.3em] uppercase mt-6" 
               style={{ 
                 fontFamily: "'Inter', sans-serif",
                 color: '#C0C0C0',
                 fontWeight: 600
               }}>
              Automotive Grade Pearls
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100px' }}
              transition={{ duration: 0.6, delay: 1.5 }}
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #DC0000, transparent)',
                margin: '1.5rem auto 0'
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
