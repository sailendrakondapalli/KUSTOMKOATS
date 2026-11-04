import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, User, Mail, Phone, Calendar, ShoppingBag, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // customer detail view

  const load = async () => {
    setLoading(true)
    try {
      // Fetch all orders and aggregate by user_id / guest_email
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, user_id, guest_name, guest_email, guest_phone, total_amount, order_status, created_at, city, state')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by email (guests) or user_id (authenticated)
      const map = {}
      ;(orders || []).forEach(o => {
        const key = o.guest_email?.toLowerCase() || o.user_id || 'unknown'
        if (!map[key]) {
          map[key] = {
            key,
            user_id: o.user_id,
            name: o.guest_name || '—',
            email: o.guest_email || null,
            phone: o.guest_phone || null,
            city: o.city || null,
            state: o.state || null,
            orders: [],
            totalSpend: 0,
            firstOrder: o.created_at,
            lastOrder: o.created_at,
          }
        }
        map[key].orders.push(o)
        map[key].totalSpend += Number(o.total_amount || 0)
        if (o.created_at < map[key].firstOrder) map[key].firstOrder = o.created_at
        if (o.created_at > map[key].lastOrder) map[key].lastOrder = o.created_at
      })

      setCustomers(Object.values(map).sort((a, b) => b.orders.length - a.orders.length))
    } catch (err) {
      console.error('Load customers error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return !q || (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q))
  })

  const S = {
    card: { background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' },
  }

  return (
    <>
      <Helmet><title>Customers | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Customers</h1>
            <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
              Aggregated from order history. No passwords or sensitive auth data shown.
            </p>
          </div>
          <div style={{ padding: '6px 14px', background: '#F5F5F5', borderRadius: 8, fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif" }}>
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#AAAAAA' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000000', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={S.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    {['Customer', 'Contact', 'Location', 'Orders', 'Total Spend', 'Last Order', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#AAAAAA', fontFamily: "'Inter', sans-serif" }}>
                      {search ? 'No customers match your search.' : 'No customer data yet.'}
                    </td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c.key} style={{ borderBottom: '1px solid #F8F8F8' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${(i * 47) % 360},70%,90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.875rem', fontWeight: 700, color: `hsl(${(i * 47) % 360},60%,35%)` }}>
                            {(c.name || 'G').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>{c.name}</p>
                            {c.user_id && <span style={{ fontSize: '0.625rem', color: '#16A34A', background: '#F0FDF4', padding: '1px 6px', borderRadius: 999, fontFamily: "'Inter', sans-serif" }}>Registered</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#555555', fontFamily: "'Inter', sans-serif", marginBottom: 2 }}><Mail size={11} />{c.email}</div>}
                        {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#555555', fontFamily: "'Inter', sans-serif" }}><Phone size={11} />{c.phone}</div>}
                        {!c.email && !c.phone && <span style={{ color: '#CCCCCC', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                        {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                          <ShoppingBag size={12} style={{ color: '#888888' }} />
                          {c.orders.length}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif" }}>
                        ₹{c.totalSpend.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif" }}>
                        {new Date(c.lastOrder).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => setSelected(c)}
                          style={{ background: 'none', border: '1px solid #E0E0E0', cursor: 'pointer', color: '#666666', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#CA2A31'; e.currentTarget.style.color = '#CA2A31' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#666666' }}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer detail drawer */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <div style={{ width: '100%', maxWidth: 440, background: '#FFFFFF', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>Customer Details</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999' }}><span style={{ fontSize: '1.25rem' }}>×</span></button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {/* Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: '16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F0F0F0' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FFE0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: '#CA2A31', flexShrink: 0 }}>
                    {(selected.name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>{selected.name}</p>
                    {selected.email && <p style={{ fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif", margin: '2px 0 0' }}>{selected.email}</p>}
                    {selected.phone && <p style={{ fontSize: '0.8125rem', color: '#666666', fontFamily: "'Inter', sans-serif", margin: '2px 0 0' }}>{selected.phone}</p>}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                  {[
                    { label: 'Total Orders', value: selected.orders.length },
                    { label: 'Total Spend', value: `₹${selected.totalSpend.toLocaleString('en-IN')}` },
                    { label: 'First Order', value: new Date(selected.firstOrder).toLocaleDateString('en-IN') },
                    { label: 'Last Order', value: new Date(selected.lastOrder).toLocaleDateString('en-IN') },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 8, padding: '12px 14px' }}>
                      <p style={{ fontSize: '0.6875rem', color: '#999999', fontFamily: "'Inter', sans-serif", margin: '0 0 3px' }}>{item.label}</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Orders */}
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Order History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.orders.map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FAFAFA', borderRadius: 7, border: '1px solid #F0F0F0' }}>
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                          #{(o.display_order_id || o.id.slice(0, 8)).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif", margin: '1px 0 0' }}>
                          {new Date(o.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                          ₹{Number(o.total_amount).toLocaleString('en-IN')}
                        </p>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: o.order_status === 'delivered' ? '#F0FDF4' : '#F5F5F5', color: o.order_status === 'delivered' ? '#16A34A' : '#666666', fontFamily: "'Inter', sans-serif", textTransform: 'capitalize' }}>
                          {o.order_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </KKAdminLayout>
    </>
  )
}
