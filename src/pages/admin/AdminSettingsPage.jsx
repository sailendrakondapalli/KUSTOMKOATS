import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Save, Settings, Building, Hash, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getSetting, setSetting } from '../../services/settingsService'
import KKAdminLayout from '../../components/admin/KKAdminLayout'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    gstin: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    pan_number: '',
    cin_number: '',
    product_id_prefix: 'KK',
    next_product_id: '100001',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const keys = Object.keys(settings)
      const loadedSettings = {}
      
      for (const key of keys) {
        const value = await getSetting(key)
        loadedSettings[key] = value || settings[key]
      }
      
      setSettings(loadedSettings)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!settings.gstin || settings.gstin.length !== 15) {
      return toast.error('GSTIN must be 15 characters')
    }
    
    if (!settings.company_name) {
      return toast.error('Company name is required')
    }

    setSaving(true)
    try {
      // Save all settings
      for (const [key, value] of Object.entries(settings)) {
        await setSetting(key, value)
      }
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const S = {
    input: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    label: {
      display: 'block',
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: '#333',
      marginBottom: '6px',
      fontFamily: "'Inter', sans-serif",
    },
    section: {
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    },
  }

  if (loading) {
    return (
      <KKAdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid #CA2A31',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#666', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
              Loading settings...
            </p>
          </div>
        </div>
      </KKAdminLayout>
    )
  }

  return (
    <KKAdminLayout>
      <Helmet>
        <title>Settings - Admin | Kustom Koats</title>
      </Helmet>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Settings size={28} style={{ color: '#CA2A31' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#000', margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>
              Global Settings
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>
            Configure company details, GST information, and product ID settings
          </p>
        </div>

        {/* Company Information */}
        <div style={S.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Building size={20} style={{ color: '#CA2A31' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>
              Company Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={S.label}>Company Name *</label>
              <input
                style={S.input}
                type="text"
                value={settings.company_name}
                onChange={(e) => updateSetting('company_name', e.target.value)}
                placeholder="KUSTOM KOATS ENTERPRISES"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={S.label}>Company Address</label>
              <textarea
                style={{ ...S.input, minHeight: '80px', resize: 'vertical' }}
                value={settings.company_address}
                onChange={(e) => updateSetting('company_address', e.target.value)}
                placeholder="Full company address"
              />
            </div>

            <div>
              <label style={S.label}>Phone Number</label>
              <input
                style={S.input}
                type="tel"
                value={settings.company_phone}
                onChange={(e) => updateSetting('company_phone', e.target.value)}
                placeholder="+91 9222777925"
              />
            </div>

            <div>
              <label style={S.label}>Email Address</label>
              <input
                style={S.input}
                type="email"
                value={settings.company_email}
                onChange={(e) => updateSetting('company_email', e.target.value)}
                placeholder="info@kustomkoats.in"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div style={S.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FileText size={20} style={{ color: '#CA2A31' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>
              Tax & Legal Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={S.label}>GSTIN Number * <span style={{ color: '#888', fontWeight: 400 }}>(15 chars)</span></label>
              <input
                style={S.input}
                type="text"
                value={settings.gstin}
                onChange={(e) => updateSetting('gstin', e.target.value.toUpperCase())}
                placeholder="27BZAPK4893D1ZZT"
                maxLength={15}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', fontFamily: "'Inter', sans-serif" }}>
                This will be used on all invoices and product forms
              </p>
            </div>

            <div>
              <label style={S.label}>PAN Number</label>
              <input
                style={S.input}
                type="text"
                value={settings.pan_number}
                onChange={(e) => updateSetting('pan_number', e.target.value.toUpperCase())}
                placeholder="AAACI4297A"
                maxLength={10}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={S.label}>CIN Number</label>
              <input
                style={S.input}
                type="text"
                value={settings.cin_number}
                onChange={(e) => updateSetting('cin_number', e.target.value)}
                placeholder="L24292WB1954PLC021516"
              />
            </div>
          </div>
        </div>

        {/* Product ID Configuration */}
        <div style={S.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Hash size={20} style={{ color: '#CA2A31' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>
              Product ID Configuration
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <div>
              <label style={S.label}>Product ID Prefix</label>
              <input
                style={S.input}
                type="text"
                value={settings.product_id_prefix}
                onChange={(e) => updateSetting('product_id_prefix', e.target.value.toUpperCase())}
                placeholder="KK"
                maxLength={5}
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', fontFamily: "'Inter', sans-serif" }}>
                e.g., "KK" for KK-100001
              </p>
            </div>

            <div>
              <label style={S.label}>Next Product ID Number</label>
              <input
                style={S.input}
                type="number"
                value={settings.next_product_id}
                onChange={(e) => updateSetting('next_product_id', e.target.value)}
                placeholder="100001"
                min="1"
              />
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px', fontFamily: "'Inter', sans-serif" }}>
                Next product will get: {settings.product_id_prefix}-{String(settings.next_product_id).padStart(6, '0')}
              </p>
            </div>
          </div>

          <div style={{
            background: '#FFF9E6',
            border: '1px solid #FFE8A3',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '16px',
          }}>
            <p style={{ fontSize: '0.8125rem', color: '#856404', margin: 0, fontFamily: "'Inter', sans-serif" }}>
              <strong>⚠️ Warning:</strong> Changing the Product ID prefix or next number will affect all new products created. Existing products will keep their current IDs.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: saving ? '#999' : '#CA2A31',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'background 0.2s',
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </KKAdminLayout>
  )
}
