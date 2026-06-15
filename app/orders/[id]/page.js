'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
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

const PAYMENT_LABELS = {
  cod:        'Cash on Delivery',
  upi:        'UPI / QR Code',
  card:       'Credit / Debit Card',
  netbanking: 'Net Banking',
  online:     'Online Payment',
}

const CARD = {
  background: 'var(--white)',
  border: '1px solid var(--grey-mid)',
  padding: '1.75rem',
  marginBottom: '1.25rem',
}

const SECTION_TITLE = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.15rem',
  fontWeight: 400,
  marginBottom: '1.25rem',
  paddingBottom: '0.75rem',
  borderBottom: '1px solid var(--grey-mid)',
  color: 'var(--charcoal)',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useSelector((s) => s.auth)

  const isSuccess = searchParams.get('success') === 'true'
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) { router.replace(`/auth/login?redirect=/orders/${id}`); return }
    axios.get(`/api/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setError('Order not found or you do not have access.'))
      .finally(() => setLoading(false))
  }, [id, isAuthenticated, router])

  if (loading) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--grey-text)' }}>Loading order…</div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--grey-text)' }}>{error || 'Order not found'}</p>
        <Link href="/orders" className="btn btn-primary" style={{ textDecoration: 'none' }}>View All Orders</Link>
      </div>
    )
  }

  const statusInfo = STATUS_CONFIG[order.status] || { bg: '#f5f5f5', color: '#555', border: '#ccc', label: order.status }

  return (
    <div style={{ paddingTop: '72px', background: 'var(--ivory)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-header" style={{ borderLeft: `5px solid ${statusInfo.border}` }}>
        <div className="page-header-eyebrow">Order Details</div>
        <h1 className="page-header-title">{order.orderNumber}</h1>
        <div className="page-header-sub" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', background: statusInfo.bg, color: statusInfo.color, fontWeight: 700 }}>
            {statusInfo.label}
          </span>
          <span>Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 6vw' }}>
        {/* Success banner */}
        {isSuccess && (
          <div className="anim-fade-up" style={{ background: '#f0fdf4', border: '1px solid #86efac', borderLeft: '4px solid #4ade80', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.4rem', color: '#15803d' }}>✓</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#15803d', marginBottom: '0.2rem' }}>Order Placed Successfully!</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#16a34a' }}>
                Thank you for your purchase. We'll notify you when your order is confirmed.
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="order-detail-grid">
          {/* Items */}
          <div style={{ gridColumn: 'span 2', ...CARD }}>
            <h2 style={SECTION_TITLE}>Items Ordered</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    paddingTop: i === 0 ? 0 : '1rem',
                    paddingBottom: i < order.items.length - 1 ? '1rem' : 0,
                    borderBottom: i < order.items.length - 1 ? '1px solid var(--grey-mid)' : 'none',
                  }}
                >
                  <div style={{ width: '76px', height: '76px', background: 'var(--grey)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--grey-mid)' }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '3px', color: 'var(--charcoal)' }}>{item.name}</div>
                    {item.variant?.label && (
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--grey-text)', marginBottom: '4px', letterSpacing: '0.05em' }}>{item.variant.label}</div>
                    )}
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
                      ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--charcoal)', flexShrink: 0, fontWeight: 400 }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div style={CARD}>
            <h2 style={SECTION_TITLE}>Shipping Address</h2>
            {order.shippingAddress && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--charcoal)' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{order.shippingAddress.name}</div>
                <div style={{ color: 'var(--grey-text)' }}>{order.shippingAddress.phone}</div>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            )}
          </div>

          {/* Payment & Summary */}
          <div style={CARD}>
            <h2 style={SECTION_TITLE}>Payment & Summary</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--charcoal)' }}>
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 9px', background: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef9c3', color: order.paymentStatus === 'paid' ? '#15803d' : '#ca8a04', fontWeight: 700 }}>
                {order.paymentStatus}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Subtotal', value: `₹${order.subtotal?.toLocaleString('en-IN')}` },
                order.discount > 0 && { label: 'Coupon discount', value: `−₹${order.discount?.toLocaleString('en-IN')}`, color: '#16a34a' },
                { label: 'Shipping', value: order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}` },
                order.tax > 0 && { label: 'Tax', value: `₹${order.tax?.toLocaleString('en-IN')}` },
              ].filter(Boolean).map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: row.color || 'var(--charcoal)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--charcoal)', paddingTop: '0.6rem', marginTop: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--gold)' }}>₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {order.statusHistory?.length > 0 && (
            <div style={{ gridColumn: 'span 2', ...CARD }}>
              <h2 style={SECTION_TITLE}>Order Timeline</h2>
              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: '7px', top: '4px', bottom: '4px', width: '1px', background: 'var(--grey-mid)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[...order.statusHistory].reverse().map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.5rem', top: '3px', width: '15px', height: '15px', borderRadius: '50%', background: i === 0 ? 'var(--gold)' : 'var(--white)', border: `2px solid ${i === 0 ? 'var(--gold)' : 'var(--grey-mid)'}`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', color: i === 0 ? 'var(--charcoal)' : 'var(--grey-dark)' }}>{entry.status?.replace(/_/g, ' ')}</div>
                        {entry.note && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '1px' }}>{entry.note}</div>}
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--grey-text)', marginTop: '2px' }}>
                          {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          <Link href="/orders" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--charcoal)', textDecoration: 'none', fontWeight: 600, padding: '0.85rem 1.75rem', border: '1.5px solid var(--charcoal)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--charcoal)'; e.currentTarget.style.color = 'var(--white)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--charcoal)' }}>
            ← All Orders
          </Link>
          <Link href="/shop" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--charcoal)', background: 'var(--gold)', textDecoration: 'none', fontWeight: 600, padding: '0.85rem 1.75rem', border: '1.5px solid var(--gold)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold-dark)'; e.currentTarget.style.borderColor = 'var(--gold-dark)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)' }}>
            Continue Shopping
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
          .order-detail-grid > div[style*="span 2"] { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  )
}
