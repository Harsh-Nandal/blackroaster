'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'refunded']

const STATUS_COLORS = {
  placed: '#ca8a04', confirmed: '#1d4ed8', processing: '#7c3aed',
  shipped: '#0369a1', out_for_delivery: '#059669', delivered: '#16a34a',
  cancelled: '#dc2626', returned: '#be185d',
}

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const CARD = { background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1.5rem', marginBottom: '1.5rem' }
const CARD_TITLE = { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 400, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--grey-mid)' }

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [update, setUpdate] = useState({ status: '', paymentStatus: '', notes: '', tracking: { carrier: '', trackingNumber: '', trackingUrl: '' } })

  useEffect(() => {
    axios.get(`/api/admin/orders/${id}`)
      .then(({ data }) => {
        setOrder(data.order)
        setUpdate(u => ({
          ...u,
          status: data.order.status,
          paymentStatus: data.order.paymentStatus,
          notes: data.order.notes || '',
          tracking: {
            carrier: data.order.tracking?.carrier || '',
            trackingNumber: data.order.tracking?.trackingNumber || '',
            trackingUrl: data.order.tracking?.trackingUrl || '',
          }
        }))
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const { data } = await axios.put(`/api/admin/orders/${id}`, update)
      setOrder(data.order)
      toast.success('Order updated')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem' }} />
      <div className="skeleton" style={{ height: '300px', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: '200px' }} />
    </div>
  )
  if (!order) return <div style={{ padding: '4rem', textAlign: 'center' }}>Order not found</div>

  const statusColor = STATUS_COLORS[order.status] || '#6b7280'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <button onClick={() => router.back()}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--grey-text)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px', textTransform: 'uppercase' }}>
            ← Back to Orders
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>{order.orderNumber}</h1>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}40` }}>
              {order.status?.replace('_', ' ')}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>
            {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 24px', background: saving ? 'var(--grey-mid)' : 'var(--gold)', color: 'var(--white)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main */}
        <div>
          {/* Items */}
          <div style={CARD}>
            <div style={CARD_TITLE}>Order Items ({order.items?.length})</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--grey-mid)' : 'none' }}>
                <div style={{ width: '56px', height: '56px', flexShrink: 0, background: 'var(--grey)', position: 'relative' }}>
                  {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="56px" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.88rem', marginBottom: '2px' }}>{item.name}</div>
                  {item.variant?.label && <div style={{ fontSize: '0.75rem', color: 'var(--grey-text)' }}>Variant: {item.variant.label}</div>}
                  <div style={{ fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>
                    ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', alignSelf: 'center' }}>
                  ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            {/* Totals */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--grey-mid)' }}>
              {[
                { label: 'Subtotal', value: order.subtotal },
                order.discount > 0 && { label: 'Discount', value: -order.discount },
                order.shippingCharge > 0 && { label: 'Shipping', value: order.shippingCharge },
                order.tax > 0 && { label: 'Tax', value: order.tax },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--grey-text)' }}>{label}</span>
                  <span>₹{Math.abs(value)?.toLocaleString('en-IN')}{value < 0 ? ' off' : ''}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--grey-mid)' }}>
                <span>Total</span>
                <span>₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div style={CARD}>
              <div style={CARD_TITLE}>Status Timeline</div>
              {order.statusHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[h.status] || '#6b7280', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>{h.status?.replace('_', ' ')}</div>
                    {h.note && <div style={{ fontSize: '0.75rem', color: 'var(--grey-text)' }}>{h.note}</div>}
                    <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)', marginTop: '2px' }}>{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Update panel */}
          <div style={CARD}>
            <div style={CARD_TITLE}>Update Order</div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }}>Order Status</label>
              <select style={INPUT} value={update.status} onChange={e => setUpdate(u => ({ ...u, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }}>Payment Status</label>
              <select style={INPUT} value={update.paymentStatus} onChange={e => setUpdate(u => ({ ...u, paymentStatus: e.target.value }))}>
                {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }}>Admin Notes</label>
              <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={update.notes} onChange={e => setUpdate(u => ({ ...u, notes: e.target.value }))} placeholder="Internal notes…" />
            </div>
            <div style={{ borderTop: '1px solid var(--grey-mid)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '0.75rem' }}>Tracking</div>
              {[
                { key: 'carrier', placeholder: 'Carrier (e.g. BlueDart)' },
                { key: 'trackingNumber', placeholder: 'Tracking Number' },
                { key: 'trackingUrl', placeholder: 'Tracking URL' },
              ].map(({ key, placeholder }) => (
                <input key={key} style={{ ...INPUT, marginBottom: '8px' }} value={update.tracking[key]}
                  onChange={e => setUpdate(u => ({ ...u, tracking: { ...u.tracking, [key]: e.target.value } }))} placeholder={placeholder} />
              ))}
            </div>
          </div>

          {/* Customer */}
          <div style={CARD}>
            <div style={CARD_TITLE}>Customer</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: '4px' }}>{order.user?.name || '—'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--grey-text)', marginBottom: '2px' }}>{order.user?.email}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--grey-text)' }}>{order.user?.phone || '—'}</div>
          </div>

          {/* Shipping Address */}
          <div style={CARD}>
            <div style={CARD_TITLE}>Shipping Address</div>
            {order.shippingAddress ? (
              <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--charcoal)' }}>
                <div style={{ fontWeight: 500 }}>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.phone}</div>
                <div>{order.shippingAddress.line1}</div>
                {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            ) : <div style={{ color: 'var(--grey-text)', fontSize: '0.82rem' }}>No address</div>}
          </div>

          {/* Payment Info */}
          <div style={CARD}>
            <div style={CARD_TITLE}>Payment</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ color: 'var(--grey-text)' }}>Method</div>
              <div style={{ textTransform: 'uppercase', fontWeight: 500 }}>{order.paymentMethod}</div>
              <div style={{ color: 'var(--grey-text)' }}>Status</div>
              <div style={{ fontWeight: 500 }}>{order.paymentStatus}</div>
              {order.paymentId && <>
                <div style={{ color: 'var(--grey-text)' }}>Payment ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all' }}>{order.paymentId}</div>
              </>}
              {order.coupon?.code && <>
                <div style={{ color: 'var(--grey-text)' }}>Coupon</div>
                <div>{order.coupon.code} (–₹{order.coupon.discount})</div>
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
