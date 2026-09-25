import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { User, Mail, MapPin, Plus, Edit2, Trash2, Star, LogOut, Package, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { fetchAddresses, saveAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/addressService'
import { fetchUserOrders } from '../services/orderService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const EMPTY_ADDR = { label: 'Home', full_name: '', phone: '', address1: '', address2: '', city: '', state: '', pincode: '', is_default: false }

const inp = 'w-full bg-[#FAFAFA] border border-[#E5D8C8] rounded-lg px-3 py-2.5 text-sm text-[#1C1006] placeholder-[#8B6A4A] focus:outline-none focus:border-[#5D3A1A]'
const lbl = 'text-xs text-[#4B3420] mb-1 block font-medium'

function AddressForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_ADDR)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error('Full name required'); return }
    if (!form.phone.trim()) { toast.error('Phone required'); return }
    if (!form.address1.trim()) { toast.error('Address required'); return }
    if (!form.city.trim()) { toast.error('City required'); return }
    if (!form.state.trim()) { toast.error('State required'); return }
    if (!form.pincode.trim()) { toast.error('Pincode required'); return }
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAFAFA] border border-[#E5D8C8] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map(l => (
            <button key={l} type="button" onClick={() => set('label', l)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.label === l ? 'bg-[#5D3A1A] text-white' : 'bg-white text-[#4B3420] border border-[#E5D8C8] hover:border-[#5D3A1A]'}`}>
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-[#4B3420] cursor-pointer">
          <input type="checkbox" checked={form.is_default} onChange={e => set('is_default', e.target.checked)} className="accent-[#5D3A1A]" />
          Set as default
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Full Name *</label>
          <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your name" className={inp} />
        </div>
        <div>
          <label className={lbl}>Phone *</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" className={inp} />
        </div>
      </div>
      <div>
        <label className={lbl}>Address Line 1 *</label>
        <input value={form.address1} onChange={e => set('address1', e.target.value)} placeholder="House / Flat / Street" className={inp} />
      </div>
      <div>
        <label className={lbl}>Address Line 2</label>
        <input value={form.address2} onChange={e => set('address2', e.target.value)} placeholder="Area / Locality (optional)" className={inp} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={lbl}>City *</label>
          <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" className={inp} />
        </div>
        <div>
          <label className={lbl}>State *</label>
          <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" className={inp} />
        </div>
        <div>
          <label className={lbl}>Pincode *</label>
          <input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6 digits" maxLength={6} className={inp} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-[#E5D8C8] text-[#4B3420] rounded-lg text-sm hover:bg-[#F5F0EB] transition-all">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#5D3A1A] text-white font-semibold rounded-lg text-sm hover:bg-[#7A4E28] disabled:opacity-60 flex items-center justify-center gap-1 transition-all">
          {saving && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save Address
        </button>
      </div>
    </form>
  )
}

export default function ProfilePage() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [loadingAddr, setLoadingAddr] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editAddr, setEditAddr] = useState(null)
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchAddresses(user.id).then(data => { setAddresses(data || []); setLoadingAddr(false) })
    fetchUserOrders(user.id).then(data => { setOrders(data || []); setLoadingOrders(false) })
  }, [user])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editAddr) {
        const updated = await updateAddress(editAddr.id, user.id, form)
        setAddresses(prev => prev.map(a => a.id === editAddr.id ? updated : a))
        toast.success('Address updated')
        setEditAddr(null)
      } else {
        const created = await saveAddress(user.id, form)
        setAddresses(prev => [...prev, created])
        toast.success('Address added')
        setShowForm(false)
      }
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id, user.id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('Address removed')
    } catch (e) {
      toast.error(e.message || 'Failed to delete')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id, user.id)
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
      toast.success('Default address updated')
    } catch (e) {
      toast.error(e.message || 'Failed to update')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out')
  }

  if (!user) return null

  return (
    <>
      <Helmet>
        <title>My Profile - Kustom Koats</title>
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-8 space-y-6">
        <h1 className="text-3xl font-bold text-[#1C1006]" style={{ fontFamily: 'Georgia, serif' }}>My Profile</h1>

        {/* User Info */}
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#5D3A1A]" />
              : <div className="w-16 h-16 rounded-full bg-[#5D3A1A] flex items-center justify-center flex-shrink-0">
                  <User size={28} className="text-white" />
                </div>
            }
            <div>
              <p className="text-[#1C1006] font-semibold text-lg">{user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}</p>
              <p className="text-[#4B3420] text-sm flex items-center gap-1.5 mt-0.5">
                <Mail size={13} className="text-[#5D3A1A]" /> {user?.email}
              </p>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-[#E5D8C8] text-[#4B3420] rounded-lg text-sm hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Addresses */}
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#5D3A1A] font-semibold flex items-center gap-2">
              <MapPin size={16} /> Saved Addresses
            </h2>
            {!showForm && !editAddr && (
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5D3A1A] text-white rounded-lg text-xs font-semibold hover:bg-[#7A4E28] transition-all">
                <Plus size={13} /> Add New
              </button>
            )}
          </div>

          {loadingAddr ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#CA2A31] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.length === 0 && !showForm && (
                <p className="text-[#8B6A4A] text-sm text-center py-6">No saved addresses yet</p>
              )}

              {addresses.map(addr => (
                <AnimatePresence key={addr.id}>
                  {editAddr?.id === addr.id ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <AddressForm initial={editAddr} onSave={handleSave} onCancel={() => setEditAddr(null)} saving={saving} />
                    </motion.div>
                  ) : (
                    <div className={`border rounded-xl p-4 transition-all ${addr.is_default ? 'border-[#5D3A1A]/40 bg-[#5D3A1A]/5' : 'border-[#E5D8C8] bg-[#FAFAFA]'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold bg-[#5D3A1A]/10 text-[#5D3A1A] px-2 py-0.5 rounded-full">{addr.label}</span>
                            {addr.is_default && <span className="text-xs font-medium text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-[#1C1006] text-sm font-medium">{addr.full_name} &middot; {addr.phone}</p>
                          <p className="text-[#4B3420] text-xs mt-0.5">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
                          <p className="text-[#4B3420] text-xs">{addr.city}, {addr.state} &middot; {addr.pincode}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefault(addr.id)} className="text-[#8B6A4A] hover:text-[#5D3A1A] transition-colors" title="Set as default">
                              <Star size={14} />
                            </button>
                          )}
                          <button onClick={() => setEditAddr(addr)} className="text-[#8B6A4A] hover:text-[#5D3A1A] transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(addr.id)} className="text-[#8B6A4A] hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              ))}

              {showForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <AddressForm onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* My Orders */}
        <div className="bg-white border border-[#E5D8C8] rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#5D3A1A] font-semibold flex items-center gap-2 mb-4">
            <Package size={16} /> My Orders
          </h2>

          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#CA2A31] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-[#E5D8C8] mb-3" />
              <p className="text-[#8B6A4A] text-sm mb-4">No orders yet</p>
              <button
                onClick={() => navigate('/shop/xtreme-kolorz')}
                className="px-4 py-2 bg-[#5D3A1A] text-white rounded-lg text-sm font-semibold hover:bg-[#7A4E28] transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const statusColors = {
                  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
                  confirmed: { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmed' },
                  processing: { bg: '#E0E7FF', text: '#3730A3', label: 'Processing' },
                  shipped: { bg: '#DDD6FE', text: '#5B21B6', label: 'Shipped' },
                  delivered: { bg: '#D1FAE5', text: '#065F46', label: 'Delivered' },
                  cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
                }
                const status = statusColors[order.order_status] || statusColors.pending

                return (
                  <div
                    key={order.id}
                    className="border border-[#E5D8C8] rounded-xl p-4 hover:border-[#5D3A1A]/40 hover:bg-[#FAFAFA] transition-all cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-[#8B6A4A]">Order #{order.razorpay_order_id || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-[#8B6A4A] mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: status.bg, color: status.text }}
                        >
                          {status.label}
                        </span>
                        <ChevronRight size={16} className="text-[#8B6A4A]" />
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
                      {order.order_items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex-shrink-0">
                          {item.products?.images?.[0] ? (
                            <img
                              src={item.products.images[0]}
                              alt={item.products.name}
                              className="w-12 h-12 object-cover rounded-lg border border-[#E5D8C8]"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#F5F0EB] rounded-lg border border-[#E5D8C8] flex items-center justify-center">
                              <Package size={20} className="text-[#8B6A4A]" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.order_items?.length > 3 && (
                        <div className="flex-shrink-0 w-12 h-12 bg-[#F5F0EB] rounded-lg border border-[#E5D8C8] flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#5D3A1A]">
                            +{order.order_items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E5D8C8]">
                      <p className="text-sm text-[#4B3420]">
                        {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm font-semibold text-[#1C1006]">
                        ₹{order.total_amount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
