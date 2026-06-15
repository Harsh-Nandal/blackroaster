'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '◈' },
  { label: 'Products', href: '/admin/products', icon: '◇' },
  { label: 'Categories', href: '/admin/categories', icon: '◎' },
  { label: 'Brands', href: '/admin/brands', icon: '◆' },
  { label: 'Orders', href: '/admin/orders', icon: '◉' },
  { label: 'Customers', href: '/admin/customers', icon: '○' },
  { label: 'Coupons', href: '/admin/coupons', icon: '◈' },
  { label: 'Reviews', href: '/admin/reviews', icon: '★' },
  { label: 'Banners', href: '/admin/banners', icon: '▣' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/auth/login?redirect=/admin/dashboard'); return }
    if (user?.role !== 'admin') router.replace('/')
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'admin') return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f4' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          flexShrink: 0,
          background: 'var(--charcoal)',
          minHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link
            href="/admin/dashboard"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', textDecoration: 'none', display: 'block' }}
          >
            Black<span style={{ color: 'var(--gold)' }}>Roaster</span>
          </Link>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginTop: '3px' }}>
            Admin Console
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '1rem 0', flex: 1, overflowY: 'auto' }}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.8rem 1.5rem',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.76rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: active ? 'var(--white)' : 'rgba(255,255,255,0.42)',
                  textDecoration: 'none',
                  background: active ? 'rgba(201,168,106,0.12)' : 'transparent',
                  borderLeft: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
                  transition: 'all 0.2s',
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.style.background = 'transparent' } }}
              >
                <span style={{ fontSize: '0.85rem', color: active ? 'var(--gold)' : 'inherit' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '30px', height: '30px', background: 'rgba(201,168,106,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--gold)', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{user?.name}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{user?.email}</div>
            </div>
          </div>
          <Link
            href="/"
            style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', opacity: 0.8 }}
            onMouseEnter={(e) => (e.target.style.opacity = '1')}
            onMouseLeave={(e) => (e.target.style.opacity = '0.8')}
          >
            ← View Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '2.5rem 3rem', minHeight: '100vh', background: '#f4f4f4' }}>
        {children}
      </main>
    </div>
  )
}
