import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Eye, CheckCircle, XCircle, Clock, Handshake } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: '#FFFBEB', color: '#D97706', icon: Clock },
  approved: { label: 'Approved', bg: '#F0FDF4', color: '#16A34A', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: '#FEF2F2', color: '#DC2626', icon: XCircle },
}

const TYPE_LABELS = {
  dealer: 'Dealer', distributor: 'Distributor', wholesaler: 'Wholesaler',
}

export default function AdminWholesalePage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wholesale_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('wholesale_applications fetch error:', error.message)
      // Table may not exist yet
      setApplications([])
    } else {
      setApplications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.full_name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.business_name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('wholesale_applications')
      .update({ status: newStatus, admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Application ${newStatus}!`)
      setSelected(null)
      load()
    }
    setUpdatingId(null)
  }

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  return (
    <>
      <Helmet><title>Wholesale | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>Wholesale Applications</h1>
          <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
            Manage dealer, distributor, and wholesaler applications.
          </p>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(s => {
            const active = statusFilter === s
            const cfg = STATUS_CONFIG[s] || {}
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 16px', border: '1px solid', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400,
                  background: active ? (s === 'all' ? '#111111' : cfg.bg) : '#FFFFFF',
                  color: active ? (s === 'all' ? '#FFFFFF' : cfg.color) : '#666666',
                  borderColor: active ? (s === 'all' ? '#111111' : cfg.color) : '#E0E0E0',
                  transition: 'all 0.15s',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#AAAAAA' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, business..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000000', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #FF0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
            <Handshake size={40} style={{ color: '#CCCCCC', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#AAAAAA', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>No applications found</p>
            <p style={{ color: '#CCCCCC', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem' }}>
              {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Wholesale applications submitted from the website will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    {['Applicant', 'Business', 'Type', 'Contact', 'Status', 'Date', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => {
                    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending
                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>{app.full_name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif", margin: 0 }}>{app.email}</p>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555555', fontFamily: "'Inter', sans-serif" }}>
                          {app.business_name || '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#F0F4FF', color: '#3B82F6', fontFamily: "'Inter', sans-serif", textTransform: 'capitalize' }}>
                            {TYPE_LABELS[app.application_type] || app.application_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#666666', fontFamily: "'Inter', sans-serif" }}>
                          {app.phone || '—'}
                          {app.city && <div>{app.city}{app.state ? `, ${app.state}` : ''}</div>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontFamily: "'Inter', sans-serif", textTransform: 'capitalize' }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif" }}>
                          {new Date(app.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => { setSelected(app); setAdminNotes(app.admin_notes || '') }}
                            style={{ background: 'none', border: '1px solid #E0E0E0', cursor: 'pointer', color: '#666666', padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 5 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF0000'; e.currentTarget.style.color = '#FF0000' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#666666' }}>
                            <Eye size={12} /> Review
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <div style={{ width: '100%', maxWidth: 480, background: '#FFFFFF', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>Application Review</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', fontSize: '1.25rem' }}>×</button>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* Status badge */}
                {(() => {
                  const cfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', borderRadius: 8, background: cfg.bg }}>
                      <cfg.icon size={16} style={{ color: cfg.color }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: cfg.color, fontFamily: "'Inter', sans-serif" }}>
                        Status: {cfg.label}
                      </span>
                    </div>
                  )
                })()}

                {/* Info grid */}
                {[
                  ['Full Name', selected.full_name],
                  ['Business Name', selected.business_name || '—'],
                  ['Application Type', TYPE_LABELS[selected.application_type] || selected.application_type],
                  ['Email', selected.email],
                  ['Phone', selected.phone || '—'],
                  ['City', selected.city || '—'],
                  ['State', selected.state || '—'],
                  ['Pincode', selected.pincode || '—'],
                  ['Submitted', new Date(selected.created_at).toLocaleString('en-IN')],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F8F8F8' }}>
                    <span style={{ flex: '0 0 140px', fontSize: '0.8125rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif" }}>{k}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#555555', fontFamily: "'Inter', sans-serif", wordBreak: 'break-word' }}>{v}</span>
                  </div>
                ))}

                {selected.message && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #F0F0F0' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666666', fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Message from applicant:</p>
                    <p style={{ fontSize: '0.8125rem', color: '#333333', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, margin: 0 }}>{selected.message}</p>
                  </div>
                )}

                {/* Admin notes */}
                <div style={{ marginTop: 20 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: 6 }}>
                    Admin Notes (optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 7, fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", color: '#000000', resize: 'vertical', height: 80, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Action buttons */}
                {selected.status === 'pending' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                    <button
                      onClick={() => updateStatus(selected.id, 'rejected')}
                      disabled={updatingId === selected.id}
                      style={{ padding: '10px', border: '2px solid #EF4444', borderRadius: 8, background: '#FFFFFF', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                      <XCircle size={15} /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, 'approved')}
                      disabled={updatingId === selected.id}
                      style={{ padding: '10px', border: 'none', borderRadius: 8, background: '#16A34A', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                      <CheckCircle size={15} /> Approve
                    </button>
                  </div>
                )}
                {selected.status !== 'pending' && (
                  <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => updateStatus(selected.id, 'pending')}
                      disabled={updatingId === selected.id}
                      style={{ flex: 1, padding: '9px', border: '1px solid #E0E0E0', borderRadius: 8, background: '#FFFFFF', color: '#666666', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                      Reset to Pending
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, selected.status === 'approved' ? 'rejected' : 'approved')}
                      disabled={updatingId === selected.id}
                      style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 8, background: selected.status === 'approved' ? '#EF4444' : '#16A34A', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                      {selected.status === 'approved' ? 'Revoke Approval' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </KKAdminLayout>
    </>
  )
}
