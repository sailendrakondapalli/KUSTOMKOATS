import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useCartStore } from "../store/cartStore"
import { useWishlistStore } from "../store/wishlistStore"
import toast from "react-hot-toast"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ── Shared input style ──
const inputCls = "w-full bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg pl-10 pr-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-[#CA2A31] transition-colors"

export default function LoginPage() {
  const [mode, setMode]           = useState("login") // "login" | "signup" | "forgot"
  const [form, setForm]           = useState({ name: "", email: "", password: "" })
  const [errors, setErrors]       = useState({})
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuthStore()
  const { mergeLocalCart, loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname || "/"

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err.message || "Google sign-in failed")
      setGoogleLoading(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Invalid email address"
    if (mode !== "forgot" && form.password.length < 8) errs.password = "Password must be at least 8 characters"
    if (mode === "signup" && !form.name.trim()) errs.name = "Name is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === "forgot") {
        await resetPassword(form.email)
        setResetSent(true)
      } else if (mode === "login") {
        const { user } = await signIn(form.email, form.password)
        await mergeLocalCart(user.id)
        await loadCart(user.id)
        await loadWishlist(user.id)
        toast.success("Welcome back!")
        navigate(from, { replace: true })
      } else {
        await signUp(form.email, form.password, form.name)
        setSignupDone(true)
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrors({})
    setResetSent(false)
    setSignupDone(false)
    setForm(f => ({ ...f, password: "" }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "#FFFFFF", paddingTop: "100px" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ background: "#CA2A31" }}>
              <span style={{ color: "#FFFFFF", fontFamily: "'Rajdhani', sans-serif", fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>K</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#000000", letterSpacing: "0.04em" }}>
            KUSTOM KOATS
          </h1>
          <p className="text-sm mt-1" style={{ color: "#888888", fontFamily: "'Inter', sans-serif" }}>
            {mode === "login"  ? "Welcome back — sign in to continue"
            : mode === "signup" ? "Create your account"
            : "Reset your password"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>

          {/* ── Signup confirmation ── */}
          {signupDone ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#FFF0F0" }}>
                <Mail size={26} style={{ color: "#CA2A31" }} />
              </div>
              <p className="font-bold text-lg mb-2" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Check your email</p>
              <p className="text-sm mb-1" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                We sent a confirmation link to
              </p>
              <p className="font-semibold text-sm mb-4" style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>{form.email}</p>
              <p className="text-xs mb-6" style={{ color: "#999999", fontFamily: "'Inter', sans-serif" }}>
                Click the link in that email to activate your account, then come back to sign in.
              </p>
              <button onClick={() => switchMode("login")}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
                Go to Sign In
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* ── Forgot password ── */}
              {mode === "forgot" ? (
                <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => switchMode("login")}
                    className="flex items-center gap-1.5 text-sm mb-5 transition-colors hover:text-[#CA2A31]"
                    style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                    <ArrowLeft size={15} /> Back to Sign In
                  </button>
                  {resetSent ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail size={22} className="text-green-500" />
                      </div>
                      <p className="font-semibold mb-1" style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>Check your email</p>
                      <p className="text-sm" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                        We sent a reset link to <span className="font-semibold" style={{ color: "#CA2A31" }}>{form.email}</span>
                      </p>
                      <button onClick={() => switchMode("login")}
                        className="mt-6 w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                        style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
                        Back to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <p className="text-sm mb-4" style={{ color: "#666666", fontFamily: "'Inter', sans-serif" }}>
                        Enter your email and we'll send you a reset link.
                      </p>
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>Email</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#AAAAAA" }} />
                          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="your@email.com" className={inputCls} />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                        style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Send Reset Link
                      </button>
                    </form>
                  )}
                </motion.div>

              ) : (
                /* ── Login / Signup ── */
                <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

                  {/* Google */}
                  <button onClick={handleGoogle} disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 mb-5 hover:bg-gray-50"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", color: "#000000", fontFamily: "'Inter', sans-serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    {googleLoading
                      ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      : <GoogleIcon />}
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px" style={{ background: "#EEEEEE" }} />
                    <span className="text-xs" style={{ color: "#AAAAAA", fontFamily: "'Inter', sans-serif" }}>or use email</span>
                    <div className="flex-1 h-px" style={{ background: "#EEEEEE" }} />
                  </div>

                  {/* Sign In / Sign Up tabs */}
                  <div className="flex rounded-xl p-1 mb-5" style={{ background: "#F5F5F5" }}>
                    <button onClick={() => switchMode("login")}
                      className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                      style={{
                        background: mode === "login" ? "#CA2A31" : "transparent",
                        color: mode === "login" ? "#FFFFFF" : "#666666",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                      Sign In
                    </button>
                    <button onClick={() => switchMode("signup")}
                      className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                      style={{
                        background: mode === "signup" ? "#CA2A31" : "transparent",
                        color: mode === "signup" ? "#FFFFFF" : "#666666",
                        fontFamily: "'Inter', sans-serif"
                      }}>
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>Full Name</label>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#AAAAAA" }} />
                          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Your name" className={inputCls} />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#AAAAAA" }} />
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="your@email.com" className={inputCls} />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold" style={{ color: "#333333", fontFamily: "'Inter', sans-serif" }}>Password</label>
                        {mode === "login" && (
                          <button type="button" onClick={() => switchMode("forgot")}
                            className="text-xs hover:underline"
                            style={{ color: "#CA2A31", fontFamily: "'Inter', sans-serif" }}>
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#AAAAAA" }} />
                        <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Min. 8 characters"
                          className={inputCls + " pr-10"} />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-black transition-colors"
                          style={{ color: "#AAAAAA" }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-2"
                      style={{ background: "#CA2A31", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                  </form>

                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Back to store */}
        <p className="text-center mt-6 text-xs" style={{ color: "#AAAAAA", fontFamily: "'Inter', sans-serif" }}>
          <Link to="/" className="hover:text-[#CA2A31] transition-colors">← Back to Kustom Koats</Link>
        </p>
      </motion.div>
    </div>
  )
}
