'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

const CARD = { background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1.5rem', marginBottom: '1.5rem' }
const CARD_TITLE = { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 400, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--grey-mid)' }

const STATUS_COLORS = {
  placed: '#ca8a04', confirmed: '#1d4ed8', processing: '#7c3aed',
  shipped: '#0369a1', delivered: '#16a34a', cancelled: '#dc2626',
}

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/admin/customers/${id}`)
      .then(({ data }) => setData(data.customer))
      .catch(() => toast.error('Failed to load customer'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem' }} />
      <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }} />
    </div>
  )
  if (!data) return <div style={{ padding: '4rem', textAlign: 'center' }}>Customer not found</div>

  const { orders = [], totalSpent = 0, ...customer } = data

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.back()}
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--grey-text)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px', textTransform: 'uppercase' }}>
          ← Back to Customers
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>{customer.name}</h1>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>
          Joined {new Date(customer.createdAt).toLocaleDateString('en-IN')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Orders', value: orders.length, color: 'var(--gold)' },
              { label: 'Total Spent', value: `₹${totalSpent?.toLocaleString('en-IN')}`, color: '#16a34a' },
              { label: 'Wishlist Items', value: customer.wishlist?.length || 0, color: '#7c3aed' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', borderTop: `3px solid ${color}`, padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div style={CARD}>
            <div style={CARD_TITLE}>Order History ({orders.length})</div>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No orders yet</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order #', 'Total', 'Status', 'Payment', 'Date'].map(h => (
                      <th key={h} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.6rem 0.8rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td style={{ padding: '0.8rem', fontSize: '0.82rem' }}>
                        <Link href={`/admin/orders/${o._id}`} style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>{o.orderNumber}</Link>
                      </td>
                      <td style={{ padding: '0.8rem', fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>₹{o.total?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', textTransform: 'uppercase', padding: '2px 8px', background: `${STATUS_COLORS[o.status] || '#6b7280'}20`, color: STATUS_COLORS[o.status] || '#6b7280' }}>
                          {o.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: 'var(--grey-text)', textTransform: 'uppercase' }}>{o.paymentMethod}</td>
                      <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: 'var(--grey-text)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={CARD}>
            <div style={CARD_TITLE}>Contact Info</div>
            {[
              { label: 'Email', value: customer.email },
              { label: 'Phone', value: customer.phone || '—' },
              { label: 'Role', value: customer.role },
              { label: 'Verified', value: customer.isVerified ? 'Yes' : 'No' },
              { label: 'Status', value: customer.isActive ? 'Active' : 'Inactive' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--grey-mid)' }}>
                <span style={{ color: 'var(--grey-text)' }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>

          {customer.addresses?.length > 0 && (
            <div style={CARD}>
              <div style={CARD_TITLE}>Addresses ({customer.addresses.length})</div>
              {customer.addresses.map((addr, i) => (
                <div key={i} style={{ fontSize: '0.82rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i < customer.addresses.length - 1 ? '1px solid var(--grey-mid)' : 'none' }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{addr.label} {addr.isDefault && <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>(Default)</span>}</div>
                  <div>{addr.name} · {addr.phone}</div>
                  <div style={{ color: 'var(--grey-text)' }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.pincode}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
