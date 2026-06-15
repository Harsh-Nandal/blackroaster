'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 10000, suffix: '+', label: 'Projects Completed', duration: 2000 },
  { value: 500, suffix: '+', label: 'Panel Designs', duration: 1500 },
  { value: 98, suffix: '%', label: 'Satisfaction Rate', duration: 1800 },
  { value: 8, suffix: '+', label: 'Years of Excellence', duration: 1200 },
]

function useCountUp(target, duration, started) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = (target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, started])
  return count
}

function StatItem({ stat, started }) {
  const count = useCountUp(stat.value, stat.duration, started)
  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--white)', lineHeight: 1, marginBottom: '0.5rem' }}>
        {count.toLocaleString('en-IN')}<span style={{ color: 'var(--gold)' }}>{stat.suffix}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
        {stat.label}
      </div>
    </div>
  )
}

export default function StatsSection() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} style={{ background: 'var(--charcoal)', padding: '80px 6vw', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(201,168,106,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', position: 'relative' }}>
        {STATS.map((stat, i) => (
          <div key={stat.label} style={{ position: 'relative' }}>
            {i > 0 && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '60px', width: '1px', background: 'rgba(255,255,255,0.08)' }} />}
            <StatItem stat={stat} started={started} />
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </section>
  )
}
