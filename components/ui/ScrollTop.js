'use client'

import { useState, useEffect } from 'react'

export default function ScrollTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '48px',
        height: '48px',
        background: 'var(--gold)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--charcoal)',
        fontSize: '1rem',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
        transition: 'all 0.4s',
        zIndex: 100,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--charcoal)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--gold)')}
    >
      ↑
    </button>
  )
}
