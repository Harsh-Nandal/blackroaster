'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const LABEL = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }
const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }

function BrandModal({ brand, onClose, onSave }) {
  const [form, setForm] = useState({
    name: brand?.name || '',
    slug: brand?.slug || '',
    description: brand?.description || '',
    logo: brand?.logo || '',
    website: brand?.website || '',
    isActive: brand?.isActive !== false,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'luxwall/brands')
      const { data } = await axios.post('/api/upload', fd)
      set('logo', data.url)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const payload = { ...form, slug }
      if (brand) {
        await axios.put(`/api/admin/brands/${brand._id}`, payload)
        toast.success('Brand updated')
      } else {
        await axios.post('/api/admin/brands', payload)
        toast.success('Brand created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', width: '480px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>{brand ? 'Edit Brand' : 'New Brand'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Name *</label>
            <input style={INPUT} value={form.name} onChange={e => { set('name', e.target.value); if (!form.slug) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Slug</label>
            <input style={INPUT} value={form.slug} onChange={e => set('slug', e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Description</label>
            <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Website URL</label>
            <input style={INPUT} type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Logo</label>
            {form.logo && (
              <div style={{ position: 'relative', width: '80px', height: '60px', marginBottom: '8px', background: 'var(--grey)' }}>
                <Image src={form.logo} alt="Brand logo" fill style={{ objectFit: 'contain' }} sizes="80px" />
              </div>
            )}
            <label style={{ display: 'block', padding: '10px', border: '2px dashed var(--grey-mid)', textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
              {uploading ? 'Uploading…' : form.logo ? 'Change Logo' : 'Upload Logo'}
              <input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
            Active
          </label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ ...BTN, background: 'var(--grey)', color: 'var(--charcoal)' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)' }}>
              {saving ? 'Saving…' : brand ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ all: 'true' })
      if (search) params.set('search', search)
      const { data } = await axios.get(`/api/admin/brands?${params}`)
      setBrands(data.brands)
    } catch { toast.error('Failed to load brands') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetch() }, [fetch])

  async function handleDelete(brand) {
    if (!confirm(`Delete "${brand.name}"?`)) return
    setDeleting(brand._id)
    try {
      await axios.delete(`/api/admin/brands/${brand._id}`)
      toast.success('Brand deleted')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally { setDeleting(null) }
  }

  const s = {
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'middle' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Brands</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{brands.length} total</p>
        </div>
        <button onClick={() => setModal('new')} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)', padding: '10px 20px' }}>
          + New Brand
        </button>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <input type="text" placeholder="Search brands…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...INPUT, width: '320px' }} />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '8px' }} />)}</div>
        ) : brands.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No brands found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th style={s.th}>Brand</th>
                <th style={s.th}>Slug</th>
                <th style={s.th}>Website</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(brand => (
                <tr key={brand._id} onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {brand.logo ? (
                        <div style={{ width: '44px', height: '32px', flexShrink: 0, position: 'relative', background: 'var(--grey)' }}>
                          <Image src={brand.logo} alt={brand.name} fill style={{ objectFit: 'contain' }} sizes="44px" />
                        </div>
                      ) : (
                        <div style={{ width: '44px', height: '32px', background: 'var(--grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--grey-text)' }}>
                          No logo
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{brand.name}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--grey-text)' }}>{brand.slug}</td>
                  <td style={{ ...s.td, fontSize: '0.8rem' }}>
                    {brand.website ? <a href={brand.website} target="_blank" rel="noopener" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Visit ↗</a> : '—'}
                  </td>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', background: brand.isActive ? '#dcfce7' : '#fee2e2', color: brand.isActive ? '#16a34a' : '#dc2626' }}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setModal(brand)} style={{ ...BTN, background: 'var(--charcoal)', color: 'var(--white)', padding: '5px 12px' }}>Edit</button>
                      <button onClick={() => handleDelete(brand)} disabled={deleting === brand._id}
                        style={{ ...BTN, background: '#fee2e2', color: '#dc2626', padding: '5px 12px' }}>
                        {deleting === brand._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <BrandModal
          brand={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}
