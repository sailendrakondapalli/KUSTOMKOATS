import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Plus, Check, CheckCircle, Upload, Copy, Smartphone, AlertCircle, Loader2, Zap, Ticket, X as XIcon, Lock, CreditCard } from "lucide-react"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { createRazorpayOrder, createPendingOrder, verifyRazorpayPayment } from '../services/orderService'
import { fetchAddresses, saveAddress } from "../services/addressService"
import { fetchActiveCodes, fetchUsedCodeIds, validatePromoCode, recordPromoUse, calcItemDiscount, checkEligibility } from "../services/promoService"
import { supabase } from "../lib/supabase"
import { formatINR } from "../utils/format"
import toast from "react-hot-toast"

const EMPTY_ADDR = { label: "Home", full_name: "", phone: "", address1: "", address2: "", city: "", state: "", pincode: "", is_default: false }

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
]

function NewAddressForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY_ADDR)
  const [errors, setErrors] = useState({})
  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = "Required"
    if (!form.phone.match(/^\d{10}$/)) e.phone = "10-digit number"
    if (!form.address1.trim()) e.address1 = "Required"
    if (!form.city.trim()) e.city = "Required"
    if (!form.state.trim()) e.state = "Required"
    if (!form.pincode.match(/^\d{6}$/)) e.pincode = "6-digit PIN"
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(form) }
  const inp = "w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black"
  const lbl = "text-xs text-gray-700 mb-1 block font-medium"
  return (
    <form onSubmit={handleSubmit} className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50 space-y-3">
      <div className="flex gap-2 mb-1">
        {["Home","Work","Other"].map(l => (
          <button key={l} type="button" onClick={() => setForm(f => ({ ...f, label: l }))}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.label === l ? "bg-black text-white" : "bg-white text-black border-2 border-gray-300"}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className={lbl}>Full Name *</label><input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="Your name" className={inp} />{errors.full_name&&<p className="text-red-400 text-xs mt-0.5">{errors.full_name}</p>}</div>
        <div><label className={lbl}>Phone *</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value.replace(/\D/g,"").slice(0,10)}))} placeholder="10-digit number" maxLength={10} inputMode="numeric" type="tel" className={inp} />{errors.phone&&<p className="text-red-400 text-xs mt-0.5">{errors.phone}</p>}</div>
        <div className="col-span-2"><label className={lbl}>Address Line 1 *</label><input value={form.address1} onChange={e=>setForm(f=>({...f,address1:e.target.value}))} placeholder="House/Flat, Street" className={inp} />{errors.address1&&<p className="text-red-400 text-xs mt-0.5">{errors.address1}</p>}</div>
        <div className="col-span-2"><label className={lbl}>Address Line 2</label><input value={form.address2} onChange={e=>setForm(f=>({...f,address2:e.target.value}))} placeholder="Landmark (optional)" className={inp} /></div>
        <div><label className={lbl}>City *</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="City" className={inp} />{errors.city&&<p className="text-red-400 text-xs mt-0.5">{errors.city}</p>}</div>
        <div>
          <label className={lbl}>State *</label>
          <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} className={inp}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state&&<p className="text-red-400 text-xs mt-0.5">{errors.state}</p>}
        </div>
        <div><label className={lbl}>PIN Code *</label><input value={form.pincode} onChange={e=>setForm(f=>({...f,pincode:e.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="6-digit PIN" maxLength={6} inputMode="numeric" type="tel" className={inp} />{errors.pincode&&<p className="text-red-400 text-xs mt-0.5">{errors.pincode}</p>}</div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-black" />
        Save as default address
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border-2 border-gray-300 text-black rounded-lg text-sm hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2 bg-black text-white font-semibold rounded-lg text-sm hover:bg-gray-800 disabled:opacity-60">Save & Use</button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const { items: cartItems, getTotal, clearCart, removeFromCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Buy Now mode: single product passed via navigation state, bypasses cart
  const buyNowData = location.state?.buyNow || null
  const isBuyNow = !!buyNowData

  // Selected items passed from CartPage (partial checkout)
  const selectedFromCart = location.state?.selectedItems || null

  // Normalise items into the same shape as cart items so the rest of the page works identically
  const items = isBuyNow
    ? [{ id: `buynow_${buyNowData.product.id}`, product_id: buyNowData.product.id, quantity: buyNowData.quantity, products: buyNowData.product }]
    : (selectedFromCart || cartItems)

  const total = items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)

  // Promo code state
  const [promoInput, setPromoInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null) // { promo, discountAmount }
  const [promoLoading, setPromoLoading] = useState(false)
  const [allPromoCodes, setAllPromoCodes] = useState([])
  const [usedCodeIds, setUsedCodeIds] = useState([])

  const cartCategories = items.map(i => i.products?.category).filter(Boolean)

  // Load all active promo codes + used IDs once on mount
  useEffect(() => {
    fetchActiveCodes().catch(() => []).then(setAllPromoCodes)
    fetchUsedCodeIds(user?.id).catch(() => []).then(setUsedCodeIds)
  }, [user?.id])

  const applyPromo = async (codeStr) => {
    const code = (codeStr || promoInput).trim()
    if (!code) return
    setPromoLoading(true)
    try {
      const result = await validatePromoCode({
        code,
        userId: user?.id,
        cartSubtotal: total,   // discount base = product subtotal only, NOT including shipping
        cartItems: items,
        cartCategories,
      })
      if (result.valid) {
        setAppliedPromo(result)
        toast.success(`Code applied! You save ${formatINR(result.discountAmount)}`)
      } else {
        toast.error(result.message)
        setAppliedPromo(null)
      }
    } catch { toast.error("Failed to validate code") }
    finally { setPromoLoading(false) }
  }

  const removePromo = () => { setAppliedPromo(null); setPromoInput("") }

  // Delivery cost: use product's delivery_charge if set, otherwise free
  const getShippingCost = (addr) => {
    return items.reduce((sum, i) => sum + (i.products?.delivery_charge || 0) * i.quantity, 0)
  }

  const [addresses, setAddresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState("address") // address | payment | success
  const [savingAddr, setSavingAddr] = useState(false)
  const [paying, setPaying] = useState(false)
  
  // Guest checkout state
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  
  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone) => /^\d{10}$/.test(phone)

  useEffect(() => {
    // For logged-in users, fetch saved addresses
    if (user?.id) {
      const userId = user.id
      fetchAddresses(userId).then(addrs => {
        setAddresses(addrs)
        // Only set default if nothing is selected yet - prevents resetting on re-render or tab focus
        setSelectedId(prev => {
          if (prev && addrs.find(a => a.id === prev)) return prev
          const def = addrs.find(a => a.is_default) || addrs[0]
          return def ? def.id : null
        })
        if (addrs.length === 0) setShowNewForm(true)
        setLoading(false)
      }).catch(() => setLoading(false))
    } else {
      // For guest users, start with empty addresses and show form
      setAddresses([])
      setShowNewForm(true)
      setLoading(false)
    }
  }, [user?.id])

  const handleSaveNew = async (form) => {
    setSavingAddr(true)
    try {
      let newAddr
      if (user?.id) {
        // For logged-in users, save to database
        newAddr = await saveAddress(user.id, form)
      } else {
        // For guest users, create temporary address object
        newAddr = {
          id: `temp_${Date.now()}`,
          ...form,
          user_id: null
        }
      }
      const updated = form.is_default ? [newAddr, ...addresses.map(a => ({ ...a, is_default: false }))] : [...addresses, newAddr]
      setAddresses(updated)
      setSelectedId(newAddr.id)
      setShowNewForm(false)
      toast.success("Address saved")
    } catch (e) { toast.error(e.message || "Failed") }
    finally { setSavingAddr(false) }
  }

  const handleRazorpayPayment = async () => {
    try {
      setPaying(true)
      
      // Validate
      if (!selectedId && addresses.length === 0) {
        toast.error('Please add a delivery address')
        setPaying(false)
        return
      }
      
      if (!user && (!guestName || !guestEmail || !guestPhone)) {
        toast.error('Please fill all guest details')
        setPaying(false)
        return
      }
      
      if (!user && !validateEmail(guestEmail)) {
        toast.error('Please enter a valid email')
        setPaying(false)
        return
      }
      
      if (!user && !validatePhone(guestPhone)) {
        toast.error('Please enter a valid 10-digit phone number')
        setPaying(false)
        return
      }
      
      const addr = addresses.find(a => a.id === selectedId)
      if (!addr) {
        toast.error('Please select an address')
        setPaying(false)
        return
      }
      
      const shipping = getShippingCost(addr)
      const discount = appliedPromo?.discountAmount || 0
      const grandTotal = Math.ceil(total + shipping - discount)
      
      // Step 1: Create Razorpay order via Edge Function
      const razorpayOrder = await createRazorpayOrder(grandTotal, `order_${Date.now()}`)
      
      // Step 2: Create pending order in database
      const dbOrder = await createPendingOrder({
        userId: user?.id || null,
        guestEmail: user?.email || guestEmail,
        guestName: user ? user.user_metadata?.full_name : guestName,
        guestPhone: user ? user.user_metadata?.phone : guestPhone,
        items,
        total: grandTotal,
        address: addr,
        razorpayOrderId: razorpayOrder.id,
        orderNotes: null
      })
      
      // Step 3: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Royal Hoof Store',
        description: `Order for ${items.length} item(s)`,
        order_id: razorpayOrder.id,
        
        // Success handler
        handler: async function (response) {
          try {
            // Step 4: Verify payment on backend
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: dbOrder.id
            })
            
            // Step 5: Clear cart and redirect to success
            if (!isBuyNow) {
              if (selectedFromCart) {
                for (const item of selectedFromCart) {
                  await removeFromCart(item.id || item.product_id, user?.id)
                }
              } else {
                await clearCart(user?.id)
              }
            }
            
            // Record promo usage
            if (appliedPromo?.promo) {
              await recordPromoUse({
                codeId: appliedPromo.promo.id,
                userId: user?.id,
                orderId: dbOrder.id
              })
            }
            
            toast.success('Payment successful!')
            navigate('/order-success', { state: { orderId: dbOrder.id } })
            
          } catch (error) {
            console.error('Payment verification failed:', error)
            toast.error('Payment verification failed. Please contact support.')
            setPaying(false)
          }
        },
        
        // Payment modal options
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled. You can retry anytime.')
            setPaying(false)
          }
        },
        
        // Prefill customer details
        prefill: {
          name: user ? user.user_metadata?.full_name : guestName,
          email: user?.email || guestEmail,
          contact: user ? user.user_metadata?.phone : guestPhone
        },
        
        // Theme
        theme: {
          color: '#5D3A1A' // Brand color
        },
        
        // Notes
        notes: {
          address: JSON.stringify(addr)
        }
      }
      
      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error)
        toast.error(`Payment failed: ${response.error.description}`)
        setPaying(false)
      })
      
      razorpay.open()
      
    } catch (error) {
      console.error('Payment initiation failed:', error)
      toast.error(error.message || 'Failed to initiate payment')
      setPaying(false)
    }
  }

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return }
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  const handleSubmitOrder = async () => {
    if (!screenshot) { toast.error("Please upload payment screenshot"); return }
    const addr = addresses.find(a => a.id === selectedId)
    if (!addr) { toast.error("Please select delivery address"); return }
    setSubmitting(true)
    try {
      const shipping = getShippingCost(addr)
      const discount = appliedPromo?.discountAmount || 0

      // Upload screenshot to Supabase Storage (product-images bucket is public)
      const ext = screenshot.name.split(".").pop()
      const path = `payment-screenshots/${user.id}_${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, screenshot, { contentType: screenshot.type })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path)

      // Split items by series based on admin-assigned custom_id prefix
      // NS1-xxx = HYD series, NS0-xxx (or anything else) = Home series
      const ns1Items = items.filter(i =>
        (i.products?.custom_id || "").toUpperCase().startsWith("NS1")
      )
      const ns0Items = items.filter(i => !ns1Items.includes(i))

      // Build list of [series, itemsForSeries] pairs - skip empty
      const orderGroups = []
      if (ns0Items.length > 0) orderGroups.push(["NS0", ns0Items])
      if (ns1Items.length > 0) orderGroups.push(["NS1", ns1Items])
      if (orderGroups.length === 0) orderGroups.push(["NS0", items]) // fallback

      const createdOrderIds = []

      for (const [series, groupItems] of orderGroups) {
        const groupSubtotal = groupItems.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0)
        // Distribute shipping proportionally - or add full shipping to first group only
        const isFirstGroup = createdOrderIds.length === 0
        // Apply discount only to first group
        const groupTotal = groupSubtotal + (isFirstGroup ? shipping : 0) - (isFirstGroup ? discount : 0)

        // Generate sequential order ID: NS0-001, NS0-002 / NS1-001, NS1-002
        const { data: seqData, error: seqErr } = await supabase.rpc("get_next_series_number", { p_series: series })
        if (seqErr) throw seqErr
        const displayOrderId = `${series}-${String(seqData).padStart(3, "0")}`

        const { data: order, error: orderErr } = await supabase.from("orders").insert({
          user_id: user.id,
          total_amount: groupTotal,
          payment_status: "pending_verification",
          payment_method: "upi",
          payment_screenshot_url: urlData.publicUrl,
          upi_ref: upiRef.trim(),
          address: JSON.stringify(addr),
          order_status: "pending",
          order_series: series,
          display_order_id: displayOrderId,
        }).select().single()
        if (orderErr) throw orderErr

        const orderItems = groupItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products?.price || 0,
        }))
        await supabase.from("order_items").insert(orderItems)
        createdOrderIds.push(displayOrderId)
      }

      const displayOrderId = createdOrderIds.join(" + ")

      // Clear only the checked-out items from cart (not unselected ones)
      if (!isBuyNow) {
        if (selectedFromCart) {
          // Partial checkout - remove only the items that were checked out
          for (const item of selectedFromCart) {
            await removeFromCart(item.id || item.product_id, user.id)
          }
        } else {
          await clearCart(user.id)
        }
      }

      // Record promo code usage so one-time codes get disabled for this user
      if (appliedPromo?.promo) {
        await recordPromoUse({ codeId: appliedPromo.promo.id, userId: user.id, orderId: null })
      }

      setStep("success")
      toast.success("Order placed! Awaiting payment verification.")
    } catch (e) {
      toast.error(e.message || "Failed to place order")
    } finally { setSubmitting(false) }
  }

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 pt-24 pb-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle size={80} className="text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-black mb-3" style={{ fontFamily: "Georgia, serif" }}>Order Placed!</h2>
        <p className="text-gray-700 mb-2">Your order is pending payment verification.</p>
        <p className="text-gray-500 text-sm mb-8">We will confirm your order once payment is verified. You will be notified.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate("/orders")} className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all">View Orders</button>
          <button onClick={() => navigate("/")} className="px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-all">Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-black mb-8" style={{ fontFamily: "Georgia, serif" }}>
        {isBuyNow ? "Buy Now" : "Checkout"}
      </h1>
      {isBuyNow && (
        <div className="mb-6 flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black">
          <Zap size={14} className="flex-shrink-0" />
          Buying <span className="font-semibold mx-1">{buyNowData.product.name}</span> directly - your cart is unchanged.
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["address","payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s || (s === "address" && step === "payment") ? "bg-black text-white" : "bg-gray-200 text-gray-600 border border-gray-300"}`}>
              {i + 1}
            </div>
            <span className={`text-sm capitalize ${step === s ? "text-black font-medium" : "text-gray-500"}`}>{s === "address" ? "Delivery Address" : "Payment"}</span>
            {i === 0 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {step === "address" && (
            <>
              {!user && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
                  <h2 className="text-black font-semibold mb-4">Guest Checkout</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-700 mb-1 block font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-700 mb-1 block font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black"
                      />
                      {guestEmail && !validateEmail(guestEmail) && (
                        <p className="text-xs text-red-500 mt-1">Please enter a valid email</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-700 mb-1 block font-medium">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black"
                      />
                      {guestPhone && !validatePhone(guestPhone) && (
                        <p className="text-xs text-red-500 mt-1">Please enter 10-digit mobile number</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-black font-semibold flex items-center gap-2"><MapPin size={16} className="text-black" /> Delivery Address</h2>
                {!showNewForm && <button onClick={() => setShowNewForm(true)} className="flex items-center gap-1 text-xs text-black font-medium hover:underline"><Plus size={13} /> Add New</button>}
              </div>
              {loading ? <div className="h-20 bg-gray-100 rounded-xl animate-pulse" /> : (
                <div className="space-y-3">
                  {showNewForm && <NewAddressForm onSave={handleSaveNew} onCancel={() => addresses.length > 0 && setShowNewForm(false)} saving={savingAddr} />}
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => { setSelectedId(addr.id); setShowNewForm(false) }}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedId === addr.id ? "border-black bg-gray-50" : "border-gray-300 bg-white hover:border-gray-500"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-black rounded-full font-medium">{addr.label}</span>
                          <p className="text-black text-sm font-medium mt-1">{addr.full_name} &middot; {addr.phone}</p>
                          <p className="text-gray-600 text-xs">{addr.address1}, {addr.city}, {addr.state} &ndash; {addr.pincode}</p>
                        </div>
                        {selectedId === addr.id && <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center ml-3"><Check size={12} className="text-white" /></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { if (!selectedId) { toast.error("Select an address"); return } setStep("payment") }}
                disabled={!selectedId || loading}
                className="w-full mt-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
                Continue to Payment &rarr;
              </button>
            </div>
            </>
          )}

          {step === "payment" && (() => {
            const selectedAddr = addresses.find(a => a.id === selectedId)
            const shipping = getShippingCost(selectedAddr)
            const discount = appliedPromo?.discountAmount || 0
            const grandTotal = Math.ceil(total + shipping - discount)
            return (
              <div className="space-y-4">
                {/* Payment Info Card */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard size={32} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-black mb-2">Secure Payment</h2>
                    <p className="text-gray-700 text-sm">Pay securely with Razorpay</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total Amount</span>
                      <span className="text-3xl font-bold text-black">{formatINR(grandTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>UPI, Cards, Net Banking, Wallets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Secure SSL encrypted payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-600" />
                      <span>Instant order confirmation</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={paying || !selectedId || loading}
                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg">
                    {paying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Pay {formatINR(grandTotal)}
                      </>
                    )}
                  </button>
                  
                  <p className="text-gray-500 text-xs text-center mt-4">
                    By proceeding, you agree to our terms and conditions
                  </p>
                </div>

                <button onClick={() => setStep("address")} className="flex items-center gap-1 text-xs text-gray-600 hover:text-black transition-colors">
                  &larr; Back to address
                </button>
              </div>
            )
          })()}
        </div>

        {/* Order Summary */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 h-fit sticky top-20 shadow-sm">
          <h2 className="text-black font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map(item => {
              // Check if this specific item qualifies for the applied promo
              const itemOriginal = (item.products?.price || 0) * item.quantity
              const itemDiscount = appliedPromo
                ? (() => {
                    const p = appliedPromo.promo
                    // Category filter
                    if (p.applicable_category &&
                      (item.products?.category || '').toLowerCase() !== p.applicable_category.toLowerCase()) return 0
                    // Per-item min price filter (when no category filter)
                    if (!p.applicable_category && p.min_order_amount &&
                      (item.products?.price || 0) < p.min_order_amount) return 0
                    if (p.discount_type === 'percentage') return Math.floor((itemOriginal * p.discount_value) / 100)
                    // flat: spread proportionally across qualifying items
                    return 0 // handled at subtotal level for flat
                  })()
                : 0
              const itemFinal = itemOriginal - itemDiscount
              return (
                <div key={item.id || item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{item.products?.name} &times; {item.quantity}</span>
                  <div className="text-right flex-shrink-0">
                    {itemDiscount > 0 && <p className="text-gray-400 line-through text-xs">{formatINR(itemOriginal)}</p>}
                    <span className={`font-medium ${itemDiscount > 0 ? 'text-green-600' : 'text-black'}`}>{formatINR(itemFinal)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t-2 border-gray-200 pt-4 space-y-2 mb-5">
            {(() => {
              const selectedAddr = addresses.find(a => a.id === selectedId)
              const shipping = getShippingCost(selectedAddr)
              const discount = appliedPromo?.discountAmount || 0
              const grandTotal = total + shipping - discount
              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="text-black font-medium">{formatINR(total)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1"><Ticket size={11} /> {appliedPromo.promo.code}
                        {appliedPromo.promo.applicable_category && (
                          <span className="text-xs text-green-500 ml-1">({appliedPromo.promo.applicable_category} only)</span>
                        )}
                      </span>
                      <span className="font-semibold">-{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Delivery</span>
                    {shipping === 0
                      ? <span className="text-green-600 font-medium">Free</span>
                      : <span className="text-black font-medium">+{formatINR(shipping)}</span>
                    }
                  </div>
                  {selectedAddr && !(items.length > 0 && items.every(i => i.products?.delivery_charge != null)) && (
                    <p className="text-gray-500 text-xs">
                      {["andhra pradesh","telangana","ap","ts"].some(s => (selectedAddr.state||"").toLowerCase().includes(s))
                        ? "AP/Telangana rate"
                        : "Other states rate"}
                    </p>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t-2 border-gray-200">
                    <span className="text-black">Total</span>
                    <span className="text-black text-lg font-bold">{formatINR(grandTotal)}</span>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Promo code input + Available Offers */}
          <div className="mb-4 space-y-3">
            {/* Applied promo chip */}
            {appliedPromo && (
              <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-green-600" />
                  <span className="text-green-700 text-sm font-semibold">{appliedPromo.promo.code}</span>
                  <span className="text-green-600 text-xs">-{formatINR(appliedPromo.discountAmount)} saved</span>
                </div>
                <button onClick={removePromo} className="text-green-400 hover:text-red-500 transition-colors">
                  <XIcon size={14} />
                </button>
              </div>
            )}

            {/* Manual input */}
            {!appliedPromo && (
              <div className="flex gap-2">
                <input value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && applyPromo()}
                  placeholder="Enter promo code"
                  className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black" />
                <button onClick={() => applyPromo()} disabled={promoLoading || !promoInput.trim()}
                  className="px-3 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1">
                  {promoLoading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                </button>
              </div>
            )}

            {/* Available promo codes list */}
            {allPromoCodes.length > 0 && (
              <div>
                <p className="text-xs text-gray-700 font-semibold mb-2 flex items-center gap-1">
                  <Ticket size={12} className="text-black" /> Available Offers
                </p>
                <div className="space-y-2">
                  {allPromoCodes.map(code => {
                    const { eligible, reason } = checkEligibility(code, {
                      cartSubtotal: total,
                      cartCategories,
                      usedIds: usedCodeIds,
                    })
                    const discount = eligible ? calcItemDiscount(code, items) : 0
                    return (
                      <div key={code.id}
                        className={`border-2 rounded-xl px-3 py-2.5 transition-all ${
                          eligible
                            ? "bg-gray-50 border-gray-300"
                            : "bg-gray-100 border-gray-200 opacity-60"
                        }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded flex-shrink-0 ${eligible ? "text-black bg-gray-200" : "text-gray-400 bg-gray-200"}`}>
                              {code.code}
                            </span>
                            <div className="min-w-0">
                              <p className={`text-xs font-medium truncate ${eligible ? "text-black" : "text-gray-400"}`}>
                                {code.discount_type === 'percentage' ? `${code.discount_value}% off` : `₹${code.discount_value} off`}
                                {code.applicable_category ? ` on ${code.applicable_category}` : ""}
                                {code.min_order_amount > 0 ? ` • Min ₹${code.min_order_amount.toLocaleString('en-IN')}` : ""}
                              </p>
                              {code.description && <p className="text-gray-400 text-xs truncate">{code.description}</p>}
                              {!eligible && reason && <p className="text-red-400 text-xs">{reason}</p>}
                              {eligible && discount > 0 && <p className="text-green-600 text-xs font-semibold">Save {formatINR(discount)}</p>}
                            </div>
                          </div>
                         {eligible && !appliedPromo ? (
  <button
    onClick={() => {
      setPromoInput(code.code)
      applyPromo(code.code)
    }}
    disabled={promoLoading}
    className="flex-shrink-0 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Apply
  </button>
) : (
  <Lock
    size={12}
    className="text-gray-300 flex-shrink-0"
  />
)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-xs text-center">🔒 UPI Payment - Secure &amp; Safe</p>
        </div>
      </div>
    </div>
  )
}








