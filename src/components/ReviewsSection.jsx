import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"

function StarRating({ value, onChange, size = 20 }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${(hovered || value) >= s ? "text-[#CA2A31] fill-[#CA2A31]" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const initials = (review.name || "U").slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#CA2A31]/10 border border-[#CA2A31]/20 flex items-center justify-center text-[#CA2A31] text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-black text-sm font-semibold">{review.name || "Customer"}</p>
            <p className="text-gray-500 text-xs">{new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size={13} />
        </div>
      </div>
      <p className="text-gray-700 text-sm mt-3 leading-relaxed">{review.review}</p>
    </motion.div>
  )
}

export default function ReviewsSection() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  // Anonymous review fields
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  useEffect(() => {
    // Only fetch approved testimonials for public display
    supabase.from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { 
        if (error) {
          console.error('Error loading reviews:', error)
        }
        setReviews(data || [])
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) { toast.error("Please write a comment"); return }
    
    // For anonymous users, require name
    if (!user && !guestName.trim()) { 
      toast.error("Please enter your name"); 
      return 
    }
    
    setSubmitting(true)
    try {
      let userName, userId
      
      if (user) {
        // Logged-in user
        userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"
        userId = user.id
      } else {
        // Anonymous user
        userName = guestName.trim()
        userId = null // No user ID for anonymous reviews
      }
      
      const reviewData = {
        user_id: userId,
        name: userName,
        rating,
        review: comment.trim(),
        is_approved: false, // All reviews start as unapproved for admin moderation
        is_active: true,
        display_order: 0
      }
      
      // Add email for anonymous users
      if (!user && guestEmail.trim()) {
        reviewData.guest_email = guestEmail.trim()
      }
      
      const { error } = await supabase.from("testimonials")
        .insert(reviewData)
      
      if (error) throw error
      
      // Don't add to display list immediately - needs admin approval first
      toast.success("Review submitted! It will be visible after admin approval.")
      
      // Reset form
      setComment("")
      setRating(5)
      setShowForm(false)
      setGuestName("")
      setGuestEmail("")
    } catch (e) {
      console.error('Review submission error:', e)
      toast.error(e.message || "Failed to submit review")
    } finally { 
      setSubmitting(false) 
    }
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12" style={{ background: '#FFFFFF', position: "relative", zIndex: 5 }}>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-sm font-bold mb-3 tracking-wider uppercase" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
          WHAT OUR CUSTOMERS SAY
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Rajdhani', 'Inter', sans-serif", color: "#000000" }}>
          Real Reviews
        </h2>
        {avgRating && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <StarRating value={Math.round(Number(avgRating))} size={20} />
            <span className="font-bold text-xl" style={{ color: "#CA2A31" }}>{avgRating}</span>
            <span className="text-sm" style={{ color: "#666666" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}
      </div>

      {/* Write review CTA */}
      {!showForm && (
        <div className="text-center mb-8">
          <button onClick={() => setShowForm(true)}
            className="px-6 py-3 font-bold rounded-lg transition-all text-sm"
            style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
            Write a Review
          </button>
          {!user && (
            <p className="text-xs mt-2" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
              No login required - share your experience!
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form id="review-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="border rounded-xl p-6 mb-8 space-y-4"
            style={{ background: "#F8F8F8", borderColor: "#E0E0E0" }}
          >
            <p className="font-semibold" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
              Share your experience
            </p>
            
            {/* Anonymous user fields */}
            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    Your Name *
                  </p>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors"
                    style={{ 
                      background: "#FFFFFF", 
                      borderColor: "#E0E0E0", 
                      color: "#000000",
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onFocus={e => e.target.style.borderColor = "#CA2A31"}
                    onBlur={e => e.target.style.borderColor = "#E0E0E0"}
                    required
                  />
                </div>
                <div>
                  <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    Email (Optional)
                  </p>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors"
                    style={{ 
                      background: "#FFFFFF", 
                      borderColor: "#E0E0E0", 
                      color: "#000000",
                      fontFamily: "'Inter', sans-serif"
                    }}
                    onFocus={e => e.target.style.borderColor = "#CA2A31"}
                    onBlur={e => e.target.style.borderColor = "#E0E0E0"}
                  />
                </div>
              </div>
            )}
            
            <div>
              <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                Your Rating
              </p>
              <StarRating value={rating} onChange={setRating} size={26} />
            </div>
            <div>
              <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                Your Review
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none transition-colors"
                style={{ 
                  background: "#FFFFFF", 
                  borderColor: "#E0E0E0", 
                  color: "#000000",
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = "#CA2A31"}
                onBlur={e => e.target.style.borderColor = "#E0E0E0"}
                required
              />
            </div>
            
            {!user && (
              <p className="text-xs" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
                * Your review will be visible after admin approval to ensure quality.
              </p>
            )}
            
            <div className="flex gap-3">
              <button type="button" onClick={() => { 
                setShowForm(false); 
                setComment(""); 
                setRating(5);
                setGuestName("");
                setGuestEmail("");
              }}
                className="flex-1 py-2.5 border rounded-lg text-sm transition-colors"
                style={{ 
                  borderColor: "#E0E0E0", 
                  color: "#666666",
                  fontFamily: "'Inter', sans-serif"
                }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 font-bold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                style={{ 
                  background: "#CA2A31", 
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif"
                }}>
                {submitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Submit Review
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="border rounded-xl p-4 h-28 animate-pulse" style={{ background: "#F8F8F8", borderColor: "#E0E0E0" }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center py-10" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  )
}
