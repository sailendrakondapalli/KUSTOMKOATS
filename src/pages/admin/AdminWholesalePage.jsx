import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Eye, CheckCircle, XCircle, Clock, Handshake, Mail, Phone, MapPin, Building } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: '#FFFBEB', color: '#D97706', icon: Clock },
  approved: { label: 'Approved', bg: '#F0FDF4', color: '#16A34A', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: '#FEF2F2', color: '#DC2626', icon: XCircle },
}

const TYPE_LABELS = {
  dealer:      'Dealer',
  distributor: 'Distributor',
  wholesaler:  'Wholesaler',
}

const TYPE_COLORS = {
  dealer:      { bg: '#EFF6FF', color: '#2563EB' },
  distributor: { bg: '#F5F3FF', color: '#7C3AED' },
  wholesaler:  { bg: '#FFF7ED', color: '#EA580C' },
}

function TypeBadge({ type }) {
  const key = (type || '').toLowerCase()
  const label = TYPE_LABELS[key] || type || 'Unknown'
  const c = TYPE_COLORS[key] || { bg: '#F5F5F5', color: '#666666' }
  return (
    <span style={{
      fontSize: '0.6875rem', fontWeight: 700,
      padding: '3px 10px', borderRadius: 999,
      background: c.bg, color: c.color,
      fontFamily: "'Inter', sans-serif",
      textTransform: 'capitalize',
    }}>
      {label}
    </span>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.6875rem', fontWeight: 700,
      padding: '4px 10px', borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      fontFamily: "'Inter', sans-serif",
    }}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
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
      setApplications([])
    } else {
      setApplications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.business_name?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('wholesale_applications')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString(),
      })
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
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #F5F5F5' }}>
      <span style={{ flex: '0 0 130px', fontSize: '0.8125rem', fontWeight: 600, color: '#444444', fontFamily: "'Inter', sans-serif" }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: value ? '#111111' : '#BBBBBB', fontFamily: "'Inter', sans-serif", wordBreak: 'break-word', fontStyle: value ? 'normal' : 'italic' }}>
        {value || 'Not provided'}
      </span>
    </div>
  )

  return (
    <>
      <Helmet><title>Wholesale | Admin | Kustom Koats</title></Helmet>
      <KKAdminLayout>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#000000', margin: 0 }}>
            Wholesale Applications
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#888888', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
            Manage dealer, distributor, and wholesaler applications.
          </p>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(s => {
            const active = statusFilter === s
            const cfg = STATUS_CONFIG[s] || {}
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
                fontSize: '0.8125rem', fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400,
                background: active ? (s === 'all' ? '#111111' : cfg.bg) : '#FFFFFF',
                color: active ? (s === 'all' ? '#FFFFFF' : cfg.color) : '#666666',
                border: `1px solid ${active ? (s === 'all' ? '#111111' : cfg.color) : '#E0E0E0'}`,
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

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, padding: '60px 24px', textAlign: 'center' }}>
            <Handshake size={40} style={{ color: '#CCCCCC', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#AAAAAA', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 600, marginBottom: 4 }}>
              No applications found
            </p>
            <p style={{ color: '#CCCCCC', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem' }}>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Wholesale applications submitted from the website will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    {['Applicant', 'Business', 'Type', 'Status', 'Date', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, color: '#999999', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #F8F8F8' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#000000', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                          {app.full_name || '—'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                          {app.email || '—'}
                        </p>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#555555', fontFamily: "'Inter', sans-serif" }}>
                        {app.business_name || <span style={{ color: '#CCCCCC', fontStyle: 'italic' }}>Not provided</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <TypeBadge type={app.application_type} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                        {new Date(app.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => { setSelected(app); setAdminNotes(app.admin_notes || '') }}
                          style={{ background: 'none', border: '1px solid #E0E0E0', cursor: 'pointer', color: '#666666', padding: '5px 12px', borderRadius: 6, fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 5 }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF0000'; e.currentTarget.style.color = '#FF0000' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.color = '#666666' }}
                        >
                          <Eye size={12} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail drawer */}
        {selected && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}
          >
            <div style={{ width: '100%', maxWidth: 500, background: '#FFFFFF', height: '100%', overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
              {/* Drawer header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>
                  Application Review
                </h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999999', fontSize: '1.25rem', lineHeight: 1, padding: 4 }}>×</button>
              </div>

              <div style={{ padding: '20px 24px', flex: 1 }}>
                {/* Status */}
                <div style={{ marginBottom: 20 }}>
                  <StatusBadge status={selected.status} />
                  {selected.application_type && (
                    <span style={{ marginLeft: 8 }}>
                      <TypeBadge type={selected.application_type} />
                    </span>
                  )}
                </div>

                {/* Applicant info */}
                <div style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 10, padding: '4px 0', marginBottom: 20 }}>
                  <InfoRow label="Full Name"         value={selected.full_name} />
                  <InfoRow label="Business Name"     value={selected.business_name} />
                  <InfoRow label="Application Type"  value={TYPE_LABELS[(selected.application_type || '').toLowerCase()] || selected.application_type} />
                  <InfoRow label="Email"             value={selected.email} />
                  <InfoRow label="Phone"             value={selected.phone} />
                  <InfoRow label="City"              value={selected.city} />
                  <InfoRow label="State"             value={selected.state} />
                  <InfoRow label="Pincode"           value={selected.pincode} />
                  <InfoRow label="Submitted"         value={new Date(selected.created_at).toLocaleString('en-IN')} />
                </div>

                {/* Message */}
                {selected.message && (
                  <div style={{ marginBottom: 20, padding: '12px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400E', fontFamily: "'Inter', sans-serif", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Message from applicant
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#333333', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, margin: 0 }}>
                      {selected.message}
                    </p>
                  </div>
                )}

                {/* Admin notes */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333333', fontFamily: "'Inter', sans-serif", display: 'block', marginBottom: 6 }}>
                    Admin Notes <span style={{ color: '#AAAAAA', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", color: '#000000', resize: 'vertical', height: 88, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Actions */}
                {selected.status === 'pending' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => updateStatus(selected.id, 'rejected')}
                      disabled={updatingId === selected.id}
                      style={{ padding: '11px', border: '2px solid #EF4444', borderRadius: 9, background: '#FFFFFF', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
                    >
                      <XCircle size={15} /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, 'approved')}
                      disabled={updatingId === selected.id}
                      style={{ padding: '11px', border: 'none', borderRadius: 9, background: '#16A34A', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                    >
                      <CheckCircle size={15} /> Approve
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => updateStatus(selected.id, 'pending')}
                      disabled={updatingId === selected.id}
                      style={{ flex: 1, padding: '10px', border: '1px solid #E0E0E0', borderRadius: 9, background: '#FFFFFF', color: '#666666', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}
                    >
                      Reset to Pending
                    </button>
                    <button
                      onClick={() => updateStatus(selected.id, selected.status === 'approved' ? 'rejected' : 'approved')}
                      disabled={updatingId === selected.id}
                      style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 9, background: selected.status === 'approved' ? '#EF4444' : '#16A34A', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}
                    >
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
