'use client'

import { useState } from 'react'

const TESTIMONIALS = [
  {
    name: 'Rajesh Malhotra',
    title: 'Interior Designer — Delhi NCR',
    rating: 5,
    text: 'I\'ve specified BlackRoaster panels in over 30 residential projects this year. The 3D geometric series gives clients that high-end look without the astronomical cost of stone cladding. Installation teams love working with them too.',
    project: 'Trade Partner',
  },
  {
    name: 'Sunita Kapoor',
    title: 'Homeowner, Mumbai',
    rating: 5,
    text: 'Transformed our living room accent wall in a single afternoon. The panels clicked together perfectly — my husband did the entire installation by himself. The quality is far beyond what I expected at this price point.',
    project: 'Home Renovation',
  },
  {
    name: 'Vikram Reddy',
    title: 'Property Developer — Hyderabad',
    rating: 5,
    text: 'We used BlackRoaster panels across 48 apartments in our latest project. The consistency between batches is remarkable, delivery was on time, and the fire-retardant certification was crucial for our building approval.',
    project: 'Bulk Order — 48 Units',
  },
  {
    name: 'Preet Arora',
    title: 'Hotel Owner, Chandigarh',
    rating: 5,
    text: 'Renovated our hotel lobby and all 22 rooms using BlackRoaster\'s fluted panels. Guests constantly compliment the modern look. The panels have held up beautifully for over a year with zero maintenance issues.',
    project: 'Commercial Installation',
  },
]

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="section">
      <div style={{ marginBottom: '4rem' }}>
        <div className="section-eyebrow">Customer Stories</div>
        <h2 className="section-title">
          Built With <em>Pride</em>
        </h2>
      </div>

      <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.name}
            onClick={() => setActive(i)}
            style={{ padding: '2.5rem', border: `1.5px solid ${active === i ? 'var(--gold)' : 'var(--grey-mid)'}`, background: active === i ? 'var(--ivory)' : 'var(--white)', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            <div style={{ display: 'flex', gap: '3px', marginBottom: '1.5rem' }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>★</span>)}
            </div>
            <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, color: 'var(--charcoal)', marginBottom: '2rem', fontStyle: 'italic' }}>
              "{t.text}"
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--charcoal)', flexShrink: 0 }}>
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)' }}>{t.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'var(--font-ui)', letterSpacing: '0.1em', marginTop: '2px' }}>{t.project}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
