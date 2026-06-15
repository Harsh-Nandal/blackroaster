'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import Link from 'next/link'

export default function AccountPage() {
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login?redirect=/account')
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  return (
    <div style={{ paddingTop: '72px' }}>
      <div className="page-header">
        <div className="page-header-eyebrow">My Account</div>
        <h1 className="page-header-title">
          Welcome, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{user.name?.split(' ')[0]}</em>
        </h1>
      </div>

      <div className="section" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { label: 'My Orders', desc: 'Track your current orders and view order history.', href: '/orders', icon: '◎' },
            { label: 'Wishlist', desc: 'Browse your saved panels and move them to cart.', href: '/wishlist', icon: '◇' },
            { label: 'Contact Support', desc: 'Need help? Reach our team for any queries.', href: '/contact', icon: '◉' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ padding: '2rem', border: '1px solid var(--grey-mid)', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'border-color 0.3s, box-shadow 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-mid)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '1rem' }}>{item.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--grey-text)', lineHeight: 1.6, fontWeight: 300 }}>{item.desc}</div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--ivory)', border: '1px solid var(--grey-mid)' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '1rem' }}>Account Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '4px' }}>Name</div>
              <div style={{ fontSize: '0.9rem' }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '0.9rem' }}>{user.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
