import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroVideo() {
  const [showIntro, setShowIntro] = useState(true)
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    // UNCOMMENT THIS LINE TO MAKE INTRO PLAY ONLY ONCE PER SESSION
    // const introShown = sessionStorage.getItem('introShown')
    // if (introShown === 'true') {
    //   setShowIntro(false)
    // }
  }, [])

  const handleVideoEnd = () => {
    setVideoEnded(true)
    sessionStorage.setItem('introShown', 'true')
    // Wait a bit then hide intro
    setTimeout(() => {
      setShowIntro(false)
    }, 500)
  }

  const handleSkip = () => {
    setVideoEnded(true)
    sessionStorage.setItem('introShown', 'true')
    setShowIntro(false)
  }

  const handleVideoError = (e) => {
    console.error('Intro video error:', e)
    setVideoError(true)
    // Auto-skip if video fails to load
    setTimeout(() => {
      setShowIntro(false)
    }, 2000)
  }

  if (!showIntro) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      >
        {/* Video */}
        {!videoError ? (
          <video
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            className="w-full h-full object-cover"
          >
            <source src="/into.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="text-white text-center">
            <p className="text-lg mb-4">Loading website...</p>
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          Skip Intro
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
