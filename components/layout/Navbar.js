'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toggleCart } from '@/store/slices/cartSlice'
import { toggleMobileMenu, toggleSearch } from '@/store/slices/uiSlice'
import { selectCartCount } from '@/store/slices/cartSlice'
import MobileMenu from './MobileMenu'
import SearchOverlay from '../ui/SearchOverlay'
import CartDrawer from '../cart/CartDrawer'

const navLinks = [
  { label: 'Collections', href: '/shop?view=collections' },
  { label: 'Shop', href: '/shop' },
  { label: 'Install Guide', href: '/install-guide' },
  { label: 'Our Story', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const pathname = usePathname()
  const cartCount = useSelector(selectCartCount)
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAdminRoute = pathname?.startsWith('/admin')
  if (isAdminRoute) return null

  // Only transparent on the home page (which has a dark hero). All other pages get a dark solid nav.
  const isHomePage = pathname === '/'
  const navBg = scrolled
    ? 'rgba(255,255,255,0.97)'
    : isHomePage
      ? 'transparent'
      : 'rgba(17,17,17,0.97)'
  const iconColor = scrolled ? 'var(--charcoal)' : 'var(--white)'
  const linkColor = scrolled ? 'var(--grey-dark)' : 'rgba(255,255,255,0.85)'

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '0 6vw',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.4s ease, box-shadow 0.4s ease',
          background: navBg,
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.08)' : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 400,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: scrolled ? 'var(--charcoal)' : 'var(--white)',
            textDecoration: 'none',
            transition: 'color 0.4s',
          }}
        >
          Black<span style={{ color: 'var(--gold)' }}>Roaster</span>
        </Link>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', margin: 0, padding: 0 }} className="nav-links-desktop">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: linkColor, textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--gold)')}
                onMouseLeave={(e) => (e.target.style.color = scrolled ? 'var(--grey-dark)' : 'rgba(255,255,255,0.85)')}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => dispatch(toggleSearch())}
            aria-label="Search"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: iconColor, fontSize: '1.1rem', display: 'flex', alignItems: 'center', transition: 'color 0.3s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--gold)')}
            onMouseLeave={(e) => (e.target.style.color = scrolled ? 'var(--charcoal)' : 'var(--white)')}
          >
            ⌕
          </button>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            style={{ color: iconColor, fontSize: '0.95rem', display: 'flex', transition: 'color 0.3s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--gold)')}
            onMouseLeave={(e) => (e.target.style.color = scrolled ? 'var(--charcoal)' : 'var(--white)')}
          >
            ♡
          </Link>

          <button
            onClick={() => dispatch(toggleCart())}
            aria-label={`Cart (${cartCount} items)`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: iconColor, display: 'flex', alignItems: 'center', transition: 'color 0.3s' }}
          >
            <span style={{ fontSize: '1rem' }}>🛍</span>
            {mounted && cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--gold)', color: 'var(--charcoal)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontFamily: 'var(--font-ui)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <Link
              href="/account"
              style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: iconColor, textDecoration: 'none', transition: 'color 0.3s' }}
            >
              {user?.name?.split(' ')[0]}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--charcoal)', padding: '0.5rem 1.2rem', fontWeight: 500, textDecoration: 'none', display: 'none' }}
              className="nav-login-btn"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => dispatch(toggleMobileMenu())}
            aria-label="Menu"
            className="hamburger-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: '5px', padding: '4px' }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: 'block', width: i === 1 ? '18px' : '24px', height: '1.5px', background: iconColor, transition: 'all 0.3s' }} />
            ))}
          </button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .nav-login-btn { display: none !important; }
        }
        @media (min-width: 769px) {
          .nav-login-btn { display: inline-flex !important; }
        }
      `}</style>

      <MobileMenu links={navLinks} />
      <SearchOverlay />
      <CartDrawer />
    </>
  )
}
