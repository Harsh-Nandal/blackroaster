'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useSelector } from 'react-redux'

const STATUS_COLORS = {
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626' },
  shipped:    { bg: '#faf5ff', color: '#7c3aed' },
  placed:     { bg: '#fef9c3', color: '#ca8a04' },
}

function StatCard({ title, value, subtitle, accent = 'var(--gold)', icon }) {
  return (
    <div
      style={{ background: 'var(--white)', padding: '1.75rem', borderTop: `3px solid ${accent}`, border: '1px solid var(--grey-mid)', borderTopColor: accent, transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--grey-text)' }}>{title}</div>
        <span style={{ fontSize: '1.1rem', color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1, marginBottom: '0.4rem' }}>{value}</div>
      {subtitle && <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--grey-text)', letterSpacing: '0.04em' }}>{subtitle}</div>}
    </div>
  )
}

function AlertCard({ href, bg, border, valueColor, label, value, linkText }) {
  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', display: 'block', padding: '1.5rem', background: bg, border: `1px solid ${border}`, transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '0.6rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: valueColor, marginBottom: '0.25rem' }}>{value}</div>
      {linkText && <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: valueColor, letterSpacing: '0.06em', opacity: 0.8 }}>{linkText} →</div>}
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((s) => s.auth)

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="skeleton" style={{ height: '32px', width: '260px', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: '16px', width: '180px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '130px' }} />)}
        </div>
      </div>
    )
  }

  const s = stats?.stats || {}

  return (
    <div className="anim-fade-in">
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Admin'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, color: 'var(--charcoal)' }}>Dashboard</h1>
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.74rem', color: 'var(--grey-text)', letterSpacing: '0.04em', background: 'var(--white)', padding: '0.5rem 1rem', border: '1px solid var(--grey-mid)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }} className="admin-stats-grid">
        <StatCard title="Total Orders" value={s.totalOrders?.toLocaleString('en-IN') || '0'} subtitle={`${s.monthOrders || 0} this month`} icon="◉" accent="var(--gold)" />
        <StatCard title="Revenue" value={`₹${((s.totalRevenue || 0) / 1000).toFixed(0)}K`} subtitle={`₹${((s.monthRevenue || 0) / 1000).toFixed(0)}K this month`} icon="◈" accent="#22c55e" />
        <StatCard title="Products" value={s.totalProducts?.toLocaleString('en-IN') || '0'} subtitle="Active listings" icon="◇" accent="#3b82f6" />
        <StatCard title="Customers" value={s.totalUsers?.toLocaleString('en-IN') || '0'} subtitle="Registered users" icon="○" accent="#8b5cf6" />
      </div>

      {/* Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
        <AlertCard
          href="/admin/reviews?status=pending"
          bg={s.pendingReviews > 0 ? '#fef3c7' : 'var(--white)'}
          border={s.pendingReviews > 0 ? '#fbbf24' : 'var(--grey-mid)'}
          valueColor={s.pendingReviews > 0 ? '#d97706' : 'var(--charcoal)'}
          label="Pending Reviews"
          value={s.pendingReviews || 0}
          linkText={s.pendingReviews > 0 ? 'Approve now' : null}
        />
        <AlertCard
          href="/admin/contacts?status=new"
          bg={s.newContacts > 0 ? '#eff6ff' : 'var(--white)'}
          border={s.newContacts > 0 ? '#93c5fd' : 'var(--grey-mid)'}
          valueColor={s.newContacts > 0 ? '#2563eb' : 'var(--charcoal)'}
          label="New Messages"
          value={s.newContacts || 0}
          linkText={s.newContacts > 0 ? 'View messages' : null}
        />
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid var(--grey-mid)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        {stats?.recentOrders?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ivory)' }}>
                  {['Order #', 'Customer', 'Amount', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1.25rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const sc = STATUS_COLORS[order.status] || { bg: '#f5f5f5', color: '#555' }
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--grey-mid)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ivory)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)', whiteSpace: 'nowrap' }}>{order.orderNumber}</td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--charcoal)' }}>{order.user?.name || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--charcoal)' }}>₹{order.total?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', background: sc.bg, color: sc.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <Link href={`/admin/orders/${order._id}`} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>View →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>
            No orders yet
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1200px) { .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .admin-stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
