'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

const footerLinks = {
  Collections: [
    { label: '3D Wall Panels', href: '/shop?category=3d-wall-panels' },
    { label: 'Ceiling Panels', href: '/shop?category=ceiling-panels' },
    { label: 'Fluted Panels', href: '/shop?category=fluted-panels' },
    { label: 'Stone Finish', href: '/shop?category=stone-finish' },
    { label: 'Wood Finish', href: '/shop?category=wood-finish' },
    { label: 'New Arrivals', href: '/shop?newArrival=true' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Factory', href: '/factory' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping Info', href: '/faq#shipping' },
    { label: 'Returns', href: '/faq#returns' },
    { label: 'Track Order', href: '/orders' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
}

export default function Footer() {
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const isAdminRoute = pathname?.startsWith('/admin')
  if (isAdminRoute) return null

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      await axios.post('/api/newsletter', { email })
      toast.success('Subscribed to BlackRoaster newsletter!')
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer style={{ background: '#0a0a0a', color: 'var(--white)', paddingTop: '80px' }}>
      <div style={{ padding: '0 6vw 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '4rem' }}>
          {/* Brand col */}
          <div>
            <Link
              href="/"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)', textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}
            >
              Black<span style={{ color: 'var(--gold)' }}>Roaster</span>
            </Link>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: '1.5rem' }}>
              Premium PVC wall panels crafted for modern Indian interiors. From design to installation — every panel built with precision and lasting quality.
            </p>

            {[
              { icon: '📍', text: 'SCO 215, Sector 34-A, Chandigarh – 160022' },
              { icon: '📞', text: '+91 98765 43210' },
              { icon: '✉', text: 'info@blackroaster.in' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--gold)', fontSize: '0.85rem', marginTop: '0.1rem', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{item.text}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {['in', 'ig', 'fb', 'yt'].map((s) => (
                <a key={s} href="#"
                  style={{ width: '36px', height: '36px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>
                {title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontWeight: 300, transition: 'color 0.3s' }}
                      onMouseEnter={(e) => (e.target.style.color = 'var(--gold)')}
                      onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.45)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '3rem 0', marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--white)', marginBottom: '0.5rem' }}>
              Stay <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Inspired</em>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
              New designs, installation tips, and exclusive offers — straight to your inbox.
            </p>
          </div>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0, minWidth: '320px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              style={{ flex: 1, height: '48px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', padding: '0 1rem', outline: 'none' }}
            />
            <button type="submit" disabled={subscribing}
              style={{ height: '48px', padding: '0 1.5rem', background: 'var(--gold)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--charcoal)', transition: 'background 0.3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--white)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
            >
              {subscribing ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>

        <div style={{ paddingTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', fontWeight: 300 }}>
            © {new Date().getFullYear()} <span style={{ color: 'var(--gold)' }}>BlackRoaster</span>. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Sitemap', '/sitemap']].map(([label, href]) => (
              <Link key={href} href={href}
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--gold)')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.25)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 3rem !important; } }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  )
}
