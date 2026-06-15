'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const LABEL = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }
const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }

function CouponModal({ coupon, onClose, onSave }) {
  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || '',
    minOrderValue: coupon?.minOrderValue || 0,
    maxDiscount: coupon?.maxDiscount || '',
    usageLimit: coupon?.usageLimit || '',
    userLimit: coupon?.userLimit || 1,
    endDate: coupon?.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
    description: coupon?.description || '',
    isActive: coupon?.isActive !== false,
  })
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.code) return toast.error('Code is required')
    if (!form.value) return toast.error('Discount value is required')
    if (!form.endDate) return toast.error('End date is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        value: Number(form.value),
        minOrderValue: Number(form.minOrderValue),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        userLimit: Number(form.userLimit),
        endDate: new Date(form.endDate),
      }
      if (coupon) {
        await axios.put(`/api/admin/coupons/${coupon._id}`, payload)
        toast.success('Coupon updated')
      } else {
        await axios.post('/api/admin/coupons', payload)
        toast.success('Coupon created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', width: '520px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>{coupon ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Coupon Code *</label>
              <input style={{ ...INPUT, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                value={form.code} onChange={e => set('code', e.target.value)} disabled={!!coupon} required placeholder="SAVE20" />
            </div>
            <div>
              <label style={LABEL}>Type</label>
              <select style={INPUT} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Discount Value *</label>
              <input style={INPUT} type="number" min="0" value={form.value} onChange={e => set('value', e.target.value)} required placeholder={form.type === 'percentage' ? '20' : '500'} />
            </div>
            <div>
              <label style={LABEL}>Min Order Value (₹)</label>
              <input style={INPUT} type="number" min="0" value={form.minOrderValue} onChange={e => set('minOrderValue', e.target.value)} />
            </div>
          </div>
          {form.type === 'percentage' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={LABEL}>Max Discount Cap (₹)</label>
              <input style={INPUT} type="number" min="0" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} placeholder="Leave empty for no cap" />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Total Usage Limit</label>
              <input style={INPUT} type="number" min="1" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} placeholder="Unlimited" />
            </div>
            <div>
              <label style={LABEL}>Per User Limit</label>
              <input style={INPUT} type="number" min="1" value={form.userLimit} onChange={e => set('userLimit', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Expiry Date *</label>
            <input style={INPUT} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Description</label>
            <textarea style={{ ...INPUT, minHeight: '60px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
            Active
          </label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ ...BTN, background: 'var(--grey)', color: 'var(--charcoal)' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)' }}>
              {saving ? 'Saving…' : coupon ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const { data } = await axios.get(`/api/admin/coupons?${params}`)
      setCoupons(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load coupons') }
    finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { fetch() }, [fetch])

  async function handleDelete(c) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return
    setDeleting(c._id)
    try {
      await axios.delete(`/api/admin/coupons/${c._id}`)
      toast.success('Coupon deleted')
      fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(null) }
  }

  const isExpired = (c) => new Date(c.endDate) < new Date()

  const s = {
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'middle' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Coupons</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{pagination.total} coupons</p>
        </div>
        <button onClick={() => setModal('new')} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)', padding: '10px 20px' }}>
          + New Coupon
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--white)', padding: '1rem 1.5rem', border: '1px solid var(--grey-mid)' }}>
        <input type="text" placeholder="Search by code…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ ...INPUT, width: '280px' }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', background: 'var(--white)', cursor: 'pointer' }}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '8px' }} />)}</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No coupons found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th style={s.th}>Code</th>
                <th style={s.th}>Discount</th>
                <th style={s.th}>Min Order</th>
                <th style={s.th}>Usage</th>
                <th style={s.th}>Expires</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => {
                const expired = isExpired(c)
                return (
                  <tr key={c._id} onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={s.td}>
                      <code style={{ background: 'var(--grey)', padding: '3px 8px', fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: 700 }}>{c.code}</code>
                      {c.description && <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)', marginTop: '4px' }}>{c.description}</div>}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                        {c.type === 'percentage' ? `${c.value}%` : `₹${c.value?.toLocaleString('en-IN')}`}
                      </span>
                      {c.maxDiscount && c.type === 'percentage' && <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)' }}>Max ₹{c.maxDiscount}</div>}
                    </td>
                    <td style={s.td}>₹{c.minOrderValue?.toLocaleString('en-IN') || 0}</td>
                    <td style={s.td}>
                      <span>{c.usedCount}</span>
                      {c.usageLimit && <span style={{ color: 'var(--grey-text)' }}> / {c.usageLimit}</span>}
                    </td>
                    <td style={{ ...s.td, color: expired ? '#dc2626' : 'var(--charcoal)', fontWeight: expired ? 600 : 400 }}>
                      {new Date(c.endDate).toLocaleDateString('en-IN')}
                      {expired && <div style={{ fontSize: '0.7rem' }}>Expired</div>}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px',
                        background: expired ? '#f3f4f6' : c.isActive ? '#dcfce7' : '#fee2e2',
                        color: expired ? '#6b7280' : c.isActive ? '#16a34a' : '#dc2626' }}>
                        {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setModal(c)} style={{ ...BTN, background: 'var(--charcoal)', color: 'var(--white)', padding: '5px 12px' }}>Edit</button>
                        <button onClick={() => handleDelete(c)} disabled={deleting === c._id}
                          style={{ ...BTN, background: '#fee2e2', color: '#dc2626', padding: '5px 12px' }}>
                          {deleting === c._id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ ...BTN, background: page === 1 ? 'var(--grey)' : 'var(--charcoal)', color: page === 1 ? 'var(--grey-text)' : 'var(--white)', padding: '8px 16px' }}>← Prev</button>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ ...BTN, background: page === pagination.pages ? 'var(--grey)' : 'var(--charcoal)', color: page === pagination.pages ? 'var(--grey-text)' : 'var(--white)', padding: '8px 16px' }}>Next →</button>
        </div>
      )}

      {modal && (
        <CouponModal
          coupon={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}
