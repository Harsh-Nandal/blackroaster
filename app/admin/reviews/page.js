'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'

const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', border: 'none', cursor: 'pointer' }

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db', fontSize: '14px' }}>★</span>
      ))}
    </span>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('pending')
  const [rating, setRating] = useState('')
  const [busy, setBusy] = useState(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (status) params.set('status', status)
      if (rating) params.set('rating', rating)
      const { data } = await axios.get(`/api/admin/reviews?${params}`)
      setReviews(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load reviews') }
    finally { setLoading(false) }
  }, [page, status, rating])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  async function handleApprove(id, approve) {
    setBusy(id)
    try {
      await axios.put(`/api/admin/reviews/${id}`, { isApproved: approve })
      toast.success(approve ? 'Review approved' : 'Review rejected')
      fetchReviews()
    } catch { toast.error('Action failed') }
    finally { setBusy(null) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review permanently?')) return
    setBusy(id)
    try {
      await axios.delete(`/api/admin/reviews/${id}`)
      toast.success('Review deleted')
      fetchReviews()
    } catch { toast.error('Delete failed') }
    finally { setBusy(null) }
  }

  const s = {
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)' },
    td: { padding: '1rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'top' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Reviews</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{pagination.total} reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--white)', padding: '1rem 1.5rem', border: '1px solid var(--grey-mid)' }}>
        {[
          { label: 'All', val: '' },
          { label: 'Pending', val: 'pending' },
          { label: 'Approved', val: 'approved' },
        ].map(({ label, val }) => (
          <button key={val} onClick={() => { setStatus(val); setPage(1) }}
            style={{ ...BTN, background: status === val ? 'var(--charcoal)' : 'var(--grey)', color: status === val ? 'var(--white)' : 'var(--charcoal)', padding: '8px 16px' }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <select value={rating} onChange={e => { setRating(e.target.value); setPage(1) }}
            style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', background: 'var(--white)', cursor: 'pointer' }}>
            <option value="">All Ratings</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', marginBottom: '8px' }} />)}</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No reviews found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th style={s.th}>Product</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Review</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id} onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {r.product?.thumbnail && (
                        <div style={{ width: '36px', height: '36px', flexShrink: 0, position: 'relative', background: 'var(--grey)' }}>
                          <Image src={r.product.thumbnail} alt={r.product.name} fill style={{ objectFit: 'cover' }} sizes="36px" />
                        </div>
                      )}
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.product?.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.user?.name || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)' }}>{r.user?.email}</div>
                    {r.isVerifiedPurchase && <div style={{ fontSize: '0.65rem', color: '#16a34a', marginTop: '2px' }}>✓ Verified Purchase</div>}
                  </td>
                  <td style={{ ...s.td, maxWidth: '280px' }}>
                    <Stars rating={r.rating} />
                    {r.title && <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>{r.title}</div>}
                    <div style={{ fontSize: '0.8rem', color: 'var(--grey-text)', marginTop: '4px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.comment}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', background: r.isApproved ? '#dcfce7' : '#fef9c3', color: r.isApproved ? '#16a34a' : '#ca8a04' }}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: '0.75rem', color: 'var(--grey-text)' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {!r.isApproved ? (
                        <button onClick={() => handleApprove(r._id, true)} disabled={busy === r._id}
                          style={{ ...BTN, background: '#dcfce7', color: '#16a34a' }}>
                          {busy === r._id ? '…' : 'Approve'}
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(r._id, false)} disabled={busy === r._id}
                          style={{ ...BTN, background: '#fef9c3', color: '#ca8a04' }}>
                          {busy === r._id ? '…' : 'Unapprove'}
                        </button>
                      )}
                      <button onClick={() => handleDelete(r._id)} disabled={busy === r._id}
                        style={{ ...BTN, background: '#fee2e2', color: '#dc2626' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </div>
  )
}
