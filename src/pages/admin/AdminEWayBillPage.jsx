import { useState, useEffect } from 'react'
import { Save, Shield, FileText, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

export default function AdminEWayBillPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    seller_gstin: '',
    seller_trade_name: '',
    seller_address_1: '',
    seller_address_2: '',
    seller_place: '',
    seller_pincode: '',
    seller_state_code: 27, // Default Maharashtra
    api_username: '',
    api_password: '',
    default_hsn_code: '3208',
    cgst_rate: 9.00,
    sgst_rate: 9.00,
    transporter_id: '',
    transporter_name: '',
    trans_mode: '1',
    is_active: true,
  })

  const states = [
    { code: 1, name: 'Jammu and Kashmir' },
    { code: 2, name: 'Himachal Pradesh' },
    { code: 3, name: 'Punjab' },
    { code: 4, name: 'Chandigarh' },
    { code: 5, name: 'Uttarakhand' },
    { code: 6, name: 'Haryana' },
    { code: 7, name: 'Delhi' },
    { code: 8, name: 'Rajasthan' },
    { code: 9, name: 'Uttar Pradesh' },
    { code: 10, name: 'Bihar' },
    { code: 11, name: 'Sikkim' },
    { code: 12, name: 'Arunachal Pradesh' },
    { code: 13, name: 'Nagaland' },
    { code: 14, name: 'Manipur' },
    { code: 15, name: 'Mizoram' },
    { code: 16, name: 'Tripura' },
    { code: 17, name: 'Meghalaya' },
    { code: 18, name: 'Assam' },
    { code: 19, name: 'West Bengal' },
    { code: 20, name: 'Jharkhand' },
    { code: 21, name: 'Odisha' },
    { code: 22, name: 'Chhattisgarh' },
    { code: 23, name: 'Madhya Pradesh' },
    { code: 24, name: 'Gujarat' },
    { code: 25, name: 'Daman and Diu' },
    { code: 26, name: 'Dadra and Nagar Haveli' },
    { code: 27, name: 'Maharashtra' },
    { code: 28, name: 'Andhra Pradesh' },
    { code: 29, name: 'Karnataka' },
    { code: 30, name: 'Goa' },
    { code: 31, name: 'Lakshadweep' },
    { code: 32, name: 'Kerala' },
    { code: 33, name: 'Tamil Nadu' },
    { code: 34, name: 'Puducherry' },
    { code: 35, name: 'Andaman and Nicobar Islands' },
    { code: 36, name: 'Telangana' },
    { code: 37, name: 'Ladakh' },
  ]

  const transModes = [
    { value: '1', label: 'Road' },
    { value: '2', label: 'Rail' },
    { value: '3', label: 'Air' },
    { value: '4', label: 'Ship' },
  ]

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('eway_bill_config')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading config:', error)
      toast.error('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!config.seller_gstin || config.seller_gstin.length !== 15) {
      return toast.error('Valid GSTIN is required (15 characters)')
    }
    
    if (!config.api_username || !config.api_password) {
      return toast.error('E-Way Bill API credentials are required')
    }

    setSaving(true)
    try {
      // Check if config exists
      const { data: existing } = await supabase
        .from('eway_bill_config')
        .select('id')
        .eq('is_active', true)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('eway_bill_config')
          .update({
            ...config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('eway_bill_config')
          .insert(config)

        if (error) throw error
      }

      toast.success('E-Way Bill configuration saved!')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <KKAdminLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #CA2A31', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '60px auto' }} />
        </div>
      </KKAdminLayout>
    )
  }

  return (
    <KKAdminLayout>
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FileText size={28} style={{ color: '#CA2A31' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#000', margin: 0 }}>
              E-Way Bill Configuration
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '8px' }}>
            Configure your Government E-Way Bill API credentials and seller details
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* API Credentials Section */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Shield size={20} style={{ color: '#CA2A31' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>API Credentials</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  E-Way Bill Username *
                </label>
                <input
                  type="text"
                  value={config.api_username}
                  onChange={(e) => setConfig({ ...config, api_username: e.target.value })}
                  placeholder="Enter API username"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  E-Way Bill Password *
                </label>
                <input
                  type="password"
                  value={config.api_password}
                  onChange={(e) => setConfig({ ...config, api_password: e.target.value })}
                  placeholder="Enter API password"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '12px', background: '#FEF3C7', borderRadius: '8px', fontSize: '0.75rem', color: '#92400E' }}>
              <strong>Note:</strong> Your credentials are stored securely. Get API credentials from{' '}
              <a href="https://ewaybillgst.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: '#CA2A31', textDecoration: 'underline' }}>
                https://ewaybillgst.gov.in/
              </a>
            </div>
          </div>

          {/* Seller Details Section */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Settings size={20} style={{ color: '#CA2A31' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Seller Details</h2>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    GSTIN *
                  </label>
                  <input
                    type="text"
                    value={config.seller_gstin}
                    onChange={(e) => setConfig({ ...config, seller_gstin: e.target.value.toUpperCase() })}
                    placeholder="15-character GSTIN"
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Trade Name *
                  </label>
                  <input
                    type="text"
                    value={config.seller_trade_name}
                    onChange={(e) => setConfig({ ...config, seller_trade_name: e.target.value })}
                    placeholder="Business name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={config.seller_address_1}
                  onChange={(e) => setConfig({ ...config, seller_address_1: e.target.value })}
                  placeholder="Building, street"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={config.seller_address_2}
                  onChange={(e) => setConfig({ ...config, seller_address_2: e.target.value })}
                  placeholder="Locality, area"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Place/City *
                  </label>
                  <input
                    type="text"
                    value={config.seller_place}
                    onChange={(e) => setConfig({ ...config, seller_place: e.target.value })}
                    placeholder="City"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={config.seller_pincode}
                    onChange={(e) => setConfig({ ...config, seller_pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    State *
                  </label>
                  <select
                    value={config.seller_state_code}
                    onChange={(e) => setConfig({ ...config, seller_state_code: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    {states.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Default Settings Section */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px' }}>Default Settings</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Default HSN Code
                </label>
                <input
                  type="text"
                  value={config.default_hsn_code}
                  onChange={(e) => setConfig({ ...config, default_hsn_code: e.target.value })}
                  placeholder="e.g. 3208"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>3208 = Paints & Varnishes</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  CGST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.cgst_rate}
                  onChange={(e) => setConfig({ ...config, cgst_rate: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  SGST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.sgst_rate}
                  onChange={(e) => setConfig({ ...config, sgst_rate: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Transport Mode
                </label>
                <select
                  value={config.trans_mode}
                  onChange={(e) => setConfig({ ...config, trans_mode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  {transModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Transporter ID
                </label>
                <input
                  type="text"
                  value={config.transporter_id}
                  onChange={(e) => setConfig({ ...config, transporter_id: e.target.value })}
                  placeholder="Optional"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                  Transporter Name
                </label>
                <input
                  type="text"
                  value={config.transporter_name}
                  onChange={(e) => setConfig({ ...config, transporter_name: e.target.value })}
                  placeholder="Optional"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.is_active}
                onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Enable E-Way Bill generation
              </span>
            </label>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              background: '#CA2A31',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Configuration
              </>
            )}
          </button>
        </form>
      </div>
    </KKAdminLayout>
  )
}
