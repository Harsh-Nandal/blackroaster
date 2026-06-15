'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const STATUS_CONFIG = {
  placed:           { bg: '#fef9c3', color: '#ca8a04', border: '#fbbf24', label: 'Placed' },
  confirmed:        { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd', label: 'Confirmed' },
  processing:       { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Processing' },
  shipped:          { bg: '#faf5ff', color: '#7c3aed', border: '#c4b5fd', label: 'Shipped' },
  out_for_delivery: { bg: '#fff7ed', color: '#ea580c', border: '#fdba74', label: 'Out for Delivery' },
  delivered:        { bg: '#dcfce7', color: '#15803d', border: '#4ade80', label: 'Delivered' },
  cancelled:        { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', label: 'Cancelled' },
  returned:         { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', label: 'Returned' },
}

export default function OrdersPage() {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/auth/login?redirect=/orders'); return }
    axios.get('/api/orders').then(({ data }) => setOrders(data.data || [])).finally(() => setLoading(false))
  }, [isAuthenticated, router])

  return (
    <div style={{ paddingTop: '72px', minHeight: '80vh', background: 'var(--ivory)' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-eyebrow">My Account</div>
        <h1 className="page-header-title">Order History</h1>
        {!loading && <p className="page-header-sub">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>}
      </div>

      <div style={{ padding: '3rem 6vw', maxWidth: '900px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--white)', border: '1px solid var(--grey-mid)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--grey-mid)', marginBottom: '1rem' }}>◉</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--charcoal)', marginBottom: '0.5rem' }}>No orders yet</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--grey-text)', marginBottom: '2rem' }}>Your purchases will appear here</p>
            <Link href="/shop" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order, idx) => {
              const s = STATUS_CONFIG[order.status] || { bg: '#f5f5f5', color: '#555', border: '#ccc', label: order.status }
              return (
                <div
                  key={order._id}
                  className="anim-fade-up"
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--grey-mid)',
                    borderLeft: `4px solid ${s.border}`,
                    padding: '1.75rem',
                    animationDelay: `${idx * 0.06}s`,
                    transition: 'box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: '3px' }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--grey-text)', letterSpacing: '0.04em' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>·</span>
                        {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', background: s.bg, color: s.color, fontWeight: 700 }}>
                        {s.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--charcoal)' }}>
                        ₹{order.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Product thumbnails */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          width: '52px',
                          height: '52px',
                          background: 'var(--grey)',
                          flexShrink: 0,
                          overflow: 'hidden',
                          border: '1px solid var(--grey-mid)',
                        }}
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div style={{ width: '52px', height: '52px', background: 'var(--ivory)', border: '1px solid var(--grey-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--grey-text)', flexShrink: 0 }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/orders/${order._id}`}
                    style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    View Details →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
