'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  placed: { bg: '#fef9c3', color: '#ca8a04' },
  confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
  processing: { bg: '#ede9fe', color: '#7c3aed' },
  shipped: { bg: '#dbeafe', color: '#0369a1' },
  out_for_delivery: { bg: '#d1fae5', color: '#059669' },
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
  returned: { bg: '#fce7f3', color: '#be185d' },
}

const PAYMENT_COLORS = {
  pending: { bg: '#fef9c3', color: '#ca8a04' },
  paid: { bg: '#dcfce7', color: '#16a34a' },
  failed: { bg: '#fee2e2', color: '#dc2626' },
  refunded: { bg: '#f3f4f6', color: '#6b7280' },
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [search, setSearch] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (status) params.set('status', status)
      if (paymentStatus) params.set('paymentStatus', paymentStatus)
      if (search) params.set('search', search)
      const { data } = await axios.get(`/api/admin/orders?${params}`)
      setOrders(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [page, status, paymentStatus, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const s = {
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)', whiteSpace: 'nowrap' },
    td: { padding: '1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'middle' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Orders</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{pagination.total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--white)', padding: '1rem 1.5rem', border: '1px solid var(--grey-mid)', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search order #…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', outline: 'none', minWidth: '200px', flex: 1 }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', background: 'var(--white)', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', background: 'var(--white)', cursor: 'pointer' }}>
          <option value="">All Payments</option>
          {Object.keys(PAYMENT_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '64px', marginBottom: '8px' }} />)}</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No orders found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th style={s.th}>Order #</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Items</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Payment</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const sc = STATUS_COLORS[order.status] || { bg: '#f3f4f6', color: '#6b7280' }
                const pc = PAYMENT_COLORS[order.paymentStatus] || { bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={order._id} onClick={() => router.push(`/admin/orders/${order._id}`)} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem' }}>{order.orderNumber}</span>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{order.user?.name || order.shippingAddress?.name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)' }}>{order.user?.email || '—'}</div>
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{order.items?.length || 0}</td>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>₹{order.total?.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', background: pc.bg, color: pc.color }}>
                          {order.paymentStatus}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--grey-text)' }}>{order.paymentMethod}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 10px', background: sc.bg, color: sc.color }}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontSize: '0.78rem', color: 'var(--grey-text)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={s.td}>
                      <Link href={`/admin/orders/${order._id}`}
                        style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', background: 'var(--charcoal)', color: 'var(--white)', textDecoration: 'none' }}>
                        View
                      </Link>
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
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', padding: '8px 16px', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', background: page === 1 ? 'var(--grey)' : 'var(--charcoal)', color: page === 1 ? 'var(--grey-text)' : 'var(--white)' }}>
            ← Prev
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', padding: '8px 16px', border: 'none', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', background: page === pagination.pages ? 'var(--grey)' : 'var(--charcoal)', color: page === pagination.pages ? 'var(--grey-text)' : 'var(--white)' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
