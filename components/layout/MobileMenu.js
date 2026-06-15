'use client'

import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { closeMobileMenu } from '@/store/slices/uiSlice'

export default function MobileMenu({ links }) {
  const dispatch = useDispatch()
  const { mobileMenuOpen } = useSelector((s) => s.ui)

  return (
    <>
      <div
        onClick={() => dispatch(closeMobileMenu())}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1099, opacity: mobileMenuOpen ? 1 : 0, pointerEvents: mobileMenuOpen ? 'all' : 'none', transition: 'opacity 0.3s' }}
      />
      <div
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px', background: 'var(--charcoal)', zIndex: 1100, transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.4s ease', padding: '6rem 2rem 3rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <button
          onClick={() => dispatch(closeMobileMenu())}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--white)', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          ×
        </button>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--white)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2rem' }}>
          Black<span style={{ color: 'var(--gold)' }}>Roaster</span>
        </div>

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => dispatch(closeMobileMenu())}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'color 0.3s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--gold)')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link
            href="/auth/login"
            onClick={() => dispatch(closeMobileMenu())}
            style={{ background: 'var(--gold)', color: 'var(--charcoal)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, padding: '1rem', textAlign: 'center', textDecoration: 'none' }}
          >
            Login / Register
          </Link>
        </div>
      </div>
    </>
  )
}
