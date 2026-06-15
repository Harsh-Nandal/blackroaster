'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const LABEL = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }
const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }

const POSITIONS = ['hero', 'middle', 'category', 'sidebar', 'popup']

function BannerModal({ banner, onClose, onSave }) {
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    image: banner?.image || '',
    mobileImage: banner?.mobileImage || '',
    link: banner?.link || '',
    position: banner?.position || 'hero',
    displayOrder: banner?.displayOrder || 0,
    isActive: banner?.isActive !== false,
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
  })
  const [uploading, setUploading] = useState({ image: false, mobileImage: false })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleUpload(field, file) {
    if (!file) return
    setUploading(u => ({ ...u, [field]: true }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'luxwall/banners')
      const { data } = await axios.post('/api/upload', fd)
      set(field, data.url)
    } catch { toast.error('Upload failed') }
    finally { setUploading(u => ({ ...u, [field]: false })) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title) return toast.error('Title is required')
    if (!form.image) return toast.error('Banner image is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        displayOrder: Number(form.displayOrder),
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
      }
      if (banner) {
        await axios.put(`/api/admin/banners/${banner._id}`, payload)
        toast.success('Banner updated')
      } else {
        await axios.post('/api/admin/banners', payload)
        toast.success('Banner created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', width: '560px', padding: '2rem', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>{banner ? 'Edit Banner' : 'New Banner'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Title *</label>
            <input style={INPUT} value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Subtitle</label>
            <input style={INPUT} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Position</label>
              <select style={INPUT} value={form.position} onChange={e => set('position', e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Display Order</label>
              <input style={INPUT} type="number" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Link URL</label>
            <input style={INPUT} value={form.link} onChange={e => set('link', e.target.value)} placeholder="/shop" />
          </div>

          {/* Image Upload */}
          {['image', 'mobileImage'].map(field => (
            <div key={field} style={{ marginBottom: '1rem' }}>
              <label style={LABEL}>{field === 'image' ? 'Banner Image *' : 'Mobile Image (optional)'}</label>
              {form[field] && (
                <div style={{ position: 'relative', height: '100px', marginBottom: '8px', background: 'var(--grey)', overflow: 'hidden' }}>
                  <Image src={form[field]} alt="Banner" fill style={{ objectFit: 'cover' }} sizes="500px" />
                </div>
              )}
              <label style={{ display: 'block', padding: '10px', border: '2px dashed var(--grey-mid)', textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
                {uploading[field] ? 'Uploading…' : form[field] ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={e => handleUpload(field, e.target.files?.[0])} style={{ display: 'none' }} disabled={uploading[field]} />
              </label>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Start Date</label>
              <input style={INPUT} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div>
              <label style={LABEL}>End Date</label>
              <input style={INPUT} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
            Active
          </label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ ...BTN, background: 'var(--grey)', color: 'var(--charcoal)' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)' }}>
              {saving ? 'Saving…' : banner ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState('')
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (position) params.set('position', position)
      const { data } = await axios.get(`/api/admin/banners?${params}`)
      setBanners(data.banners)
    } catch { toast.error('Failed to load banners') }
    finally { setLoading(false) }
  }, [position])

  useEffect(() => { fetch() }, [fetch])

  async function handleDelete(b) {
    if (!confirm(`Delete banner "${b.title}"?`)) return
    setDeleting(b._id)
    try {
      await axios.delete(`/api/admin/banners/${b._id}`)
      toast.success('Banner deleted')
      fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(null) }
  }

  async function toggleActive(b) {
    try {
      await axios.put(`/api/admin/banners/${b._id}`, { ...b, isActive: !b.isActive })
      toast.success(`Banner ${!b.isActive ? 'activated' : 'deactivated'}`)
      fetch()
    } catch { toast.error('Update failed') }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Banners</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{banners.length} banners</p>
        </div>
        <button onClick={() => setModal('new')} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)', padding: '10px 20px' }}>
          + New Banner
        </button>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[{ label: 'All', val: '' }, ...POSITIONS.map(p => ({ label: p, val: p }))].map(({ label, val }) => (
          <button key={val} onClick={() => setPosition(val)}
            style={{ ...BTN, background: position === val ? 'var(--charcoal)' : 'var(--grey)', color: position === val ? 'var(--white)' : 'var(--charcoal)', padding: '6px 14px' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', marginBottom: '12px' }} />)}</div>
      ) : banners.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', background: 'var(--white)', border: '1px solid var(--grey-mid)' }}>
          No banners found
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {banners.map(b => (
            <div key={b._id} style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', display: 'flex', gap: '1.5rem', padding: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '160px', height: '90px', flexShrink: 0, position: 'relative', background: 'var(--grey)', overflow: 'hidden' }}>
                {b.image && <Image src={b.image} alt={b.title} fill style={{ objectFit: 'cover' }} sizes="160px" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{b.title}</div>
                {b.subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--grey-text)', marginBottom: '6px' }}>{b.subtitle}</div>}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', background: 'var(--grey)', color: 'var(--charcoal)' }}>{b.position}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', background: b.isActive ? '#dcfce7' : '#fee2e2', color: b.isActive ? '#16a34a' : '#dc2626' }}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--grey-text)' }}>Order: {b.displayOrder}</span>
                  {b.endDate && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--grey-text)' }}>Ends: {new Date(b.endDate).toLocaleDateString('en-IN')}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => toggleActive(b)}
                  style={{ ...BTN, background: b.isActive ? '#fef9c3' : '#dcfce7', color: b.isActive ? '#ca8a04' : '#16a34a', padding: '6px 12px' }}>
                  {b.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setModal(b)}
                  style={{ ...BTN, background: 'var(--charcoal)', color: 'var(--white)', padding: '6px 12px' }}>Edit</button>
                <button onClick={() => handleDelete(b)} disabled={deleting === b._id}
                  style={{ ...BTN, background: '#fee2e2', color: '#dc2626', padding: '6px 12px' }}>
                  {deleting === b._id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <BannerModal
          banner={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}
