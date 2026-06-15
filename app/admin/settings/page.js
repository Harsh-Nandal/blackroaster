'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const LABEL = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }
const SECTION = { background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1.75rem', marginBottom: '1.5rem' }
const SECTION_TITLE = { fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--grey-mid)' }

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={LABEL}>{label}</label>
      {hint && <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--grey-text)', marginBottom: '6px' }}>{hint}</p>}
      {children}
    </div>
  )
}

const DEFAULT_SETTINGS = {
  siteName: 'BlackRoaster',
  siteTagline: 'Premium PVC Wall Panels',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  freeShippingThreshold: '999',
  shippingCharge: '99',
  taxRate: '0',
  instagramUrl: '',
  facebookUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  metaTitle: '',
  metaDescription: '',
  maintenanceMode: 'false',
  orderPrefix: 'LW',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/admin/settings')
      .then(({ data }) => {
        // Only merge keys the admin controls — never touch orderCounter or other internal keys
        const known = Object.keys(DEFAULT_SETTINGS)
        const filtered = {}
        known.forEach(k => { if (data.settings[k] !== undefined) filtered[k] = data.settings[k] })
        setSettings(s => ({ ...s, ...filtered }))
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  function set(key, val) { setSettings(s => ({ ...s, [key]: val })) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      // Only save keys the admin controls — never overwrite internal keys like orderCounter
      const settingsArray = Object.keys(DEFAULT_SETTINGS).map(key => ({
        key,
        value: String(settings[key] ?? ''),
        group: getGroup(key),
      }))
      await axios.post('/api/admin/settings', { settings: settingsArray })
      toast.success('Settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function getGroup(key) {
    if (['siteName', 'siteTagline', 'contactEmail', 'contactPhone', 'contactAddress'].includes(key)) return 'general'
    if (['freeShippingThreshold', 'shippingCharge', 'taxRate', 'orderPrefix'].includes(key)) return 'commerce'
    if (key.endsWith('Url') || key === 'whatsappNumber') return 'social'
    if (['metaTitle', 'metaDescription'].includes(key)) return 'seo'
    return 'general'
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem' }} />
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '200px', marginBottom: '1rem' }} />)}
      </div>
    )
  }

  return (
    <form onSubmit={handleSave}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Settings</h1>
        <button type="submit" disabled={saving}
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 24px', background: saving ? 'var(--grey-mid)' : 'var(--gold)', color: 'var(--white)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* General */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>General</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Site Name">
            <input style={INPUT} value={settings.siteName} onChange={e => set('siteName', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input style={INPUT} value={settings.siteTagline} onChange={e => set('siteTagline', e.target.value)} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Contact Email">
            <input style={INPUT} type="email" value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
          </Field>
          <Field label="Contact Phone">
            <input style={INPUT} value={settings.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
          </Field>
        </div>
        <Field label="Contact Address">
          <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={settings.contactAddress} onChange={e => set('contactAddress', e.target.value)} />
        </Field>
      </div>

      {/* Commerce */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>Commerce</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <Field label="Free Shipping Above (₹)" hint="0 = always paid">
            <input style={INPUT} type="number" min="0" value={settings.freeShippingThreshold} onChange={e => set('freeShippingThreshold', e.target.value)} />
          </Field>
          <Field label="Shipping Charge (₹)">
            <input style={INPUT} type="number" min="0" value={settings.shippingCharge} onChange={e => set('shippingCharge', e.target.value)} />
          </Field>
          <Field label="Tax Rate (%)" hint="Applied to orders">
            <input style={INPUT} type="number" min="0" step="0.1" value={settings.taxRate} onChange={e => set('taxRate', e.target.value)} />
          </Field>
          <Field label="Order Number Prefix">
            <input style={INPUT} value={settings.orderPrefix} onChange={e => set('orderPrefix', e.target.value)} placeholder="LW" />
          </Field>
        </div>
      </div>

      {/* Social Media */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>Social Media</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { key: 'instagramUrl', label: 'Instagram URL' },
            { key: 'facebookUrl', label: 'Facebook URL' },
            { key: 'twitterUrl', label: 'Twitter / X URL' },
            { key: 'youtubeUrl', label: 'YouTube URL' },
            { key: 'whatsappNumber', label: 'WhatsApp Number' },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <input style={INPUT} value={settings[key]} onChange={e => set(key, e.target.value)} placeholder="https://" />
            </Field>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>SEO Defaults</div>
        <Field label="Default Meta Title">
          <input style={INPUT} value={settings.metaTitle} onChange={e => set('metaTitle', e.target.value)} />
        </Field>
        <Field label="Default Meta Description">
          <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={settings.metaDescription} onChange={e => set('metaDescription', e.target.value)} />
        </Field>
      </div>

      {/* Maintenance */}
      <div style={SECTION}>
        <div style={SECTION_TITLE}>Maintenance</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={settings.maintenanceMode === 'true'}
            onChange={e => set('maintenanceMode', e.target.checked ? 'true' : 'false')}
            style={{ width: '16px', height: '16px', accentColor: '#dc2626' }} />
          <span>
            <strong>Enable Maintenance Mode</strong>
            <span style={{ color: 'var(--grey-text)', marginLeft: '8px' }}>— Shows a maintenance page to visitors (admins can still access)</span>
          </span>
        </label>
      </div>
    </form>
  )
}
