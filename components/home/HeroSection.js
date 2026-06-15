'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

const heroStats = [
  { value: '500+', label: 'Panel Designs' },
  { value: '10K+', label: 'Projects Done' },
  { value: '4.9★', label: 'Avg. Rating' },
]

export default function HeroSection() {
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 30
      const y = (clientY / innerHeight - 0.5) * 20
      const visual = hero.querySelector('.hero-visual-inner')
      if (visual) visual.style.transform = `translate(${x}px, ${y}px)`
    }
    hero.addEventListener('mousemove', handleMouseMove)
    return () => hero.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={heroRef}
      style={{ minHeight: '100vh', background: 'var(--charcoal)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}
    >
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(201,168,106,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Gold accent line */}
      <div style={{ position: 'absolute', top: 0, left: '6vw', width: '1px', height: '45%', background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)', opacity: 0.4 }} />

      <div
        style={{ padding: '0 6vw', width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center', paddingTop: '72px' }}
        className="hero-inner"
      >
        {/* Left content */}
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'inline-block', width: '40px', height: '1px', background: 'var(--gold)' }} />
            Premium PVC Wall Panels
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 5.5rem)', fontWeight: 300, lineHeight: 1.05, color: 'var(--white)', marginBottom: '1.5rem' }}>
            Elevate Every<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)', display: 'block' }}>Wall, Every Room</em>
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontWeight: 300, maxWidth: '460px', marginBottom: '2.5rem' }}>
            Precision-crafted PVC wall panels that transform interiors instantly. Waterproof, fire-retardant, and built to last — designed for modern Indian homes and commercial spaces.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <Link
              href="/shop"
              style={{ background: 'var(--gold)', color: 'var(--charcoal)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, padding: '0 2rem', height: '52px', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--white)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gold)' }}
            >
              Shop Panels →
            </Link>
            <Link
              href="/about"
              style={{ background: 'transparent', color: 'var(--white)', border: '1.5px solid rgba(255,255,255,0.3)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500, padding: '0 2rem', height: '52px', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--charcoal)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--white)' }}
            >
              View Installations
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '3rem' }}>
            {heroStats.map((stat, i) => (
              <div key={stat.label} style={{ position: 'relative' }}>
                {i > 0 && <div style={{ position: 'absolute', left: '-1.5rem', top: '50%', transform: 'translateY(-50%)', height: '30px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--white)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div style={{ position: 'relative' }} className="hero-visual">
          <div className="hero-visual-inner" style={{ transition: 'transform 0.3s ease', willChange: 'transform' }}>
            {/* Panel texture visual */}
            <div style={{ aspectRatio: '3/4', background: 'linear-gradient(135deg, #1a1610 0%, #0d0b08 100%)', position: 'relative', overflow: 'hidden' }}>
              {/* 3D panel grid pattern */}
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: '4px', padding: '4px' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} style={{ background: `linear-gradient(${135 + (i % 4) * 15}deg, rgba(201,168,106,${0.06 + (i % 3) * 0.03}) 0%, rgba(201,168,106,0.02) 100%)`, border: '1px solid rgba(201,168,106,0.08)' }} />
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
                <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Now Available</div>
                <div style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>3D Geometric Series</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', marginTop: '4px' }}>Waterproof · Fire Retardant · Easy Install</div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', background: 'var(--gold)', padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--charcoal)', lineHeight: 1 }}>BIS</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--charcoal)' }}>Certified</div>
            </div>

            <div style={{ position: 'absolute', bottom: '2rem', left: '-2rem', background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(201,168,106,0.2)', padding: '1rem 1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)' }}>★ 4.9</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>10,000+ Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Scroll</div>
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)', animation: 'scrollPulse 2s ease-in-out infinite' }} />
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr !important; padding-top: 100px !important; padding-bottom: 60px !important; }
          .hero-visual { display: none !important; }
        }
      `}</style>
    </section>
  )
}
