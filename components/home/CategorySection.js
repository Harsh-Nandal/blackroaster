'use client'

import Link from 'next/link'

const CATEGORIES = [
  { name: '3D Wall Panels', slug: '3d-wall-panels', count: 48, accent: '#C9A86A' },
  { name: 'Ceiling Panels', slug: 'ceiling-panels', count: 22, accent: '#A0803D' },
  { name: 'Fluted Panels', slug: 'fluted-panels', count: 18, accent: '#C9A86A' },
  { name: 'Stone Finish', slug: 'stone-finish', count: 16, accent: '#A0803D' },
  { name: 'Wood Finish', slug: 'wood-finish', count: 24, accent: '#C9A86A' },
]

export default function CategorySection() {
  return (
    <section className="section">
      <div style={{ marginBottom: '3rem' }}>
        <div className="section-eyebrow">Browse by Type</div>
        <h2 className="section-title">
          Find Your <em>Perfect</em> Panel
        </h2>
      </div>

      <div
        className="category-grid"
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '1.5rem' }}
      >
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            style={{ position: 'relative', overflow: 'hidden', display: 'block', aspectRatio: i === 0 ? '16/9' : '4/5', gridColumn: i === 0 ? 'span 2' : 'span 1', textDecoration: 'none' }}
          >
            <div
              style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, #1a1610 0%, #0d0b08 100%)`, transition: 'transform 0.6s ease' }}
              className="cat-bg"
            />
            {/* Panel texture pattern per category */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: i === 0
              ? `repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(201,168,106,0.06) 18px, rgba(201,168,106,0.06) 19px), repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(201,168,106,0.04) 18px, rgba(201,168,106,0.04) 19px)`
              : `repeating-linear-gradient(${i * 30}deg, transparent, transparent 20px, rgba(201,168,106,0.05) 20px, rgba(201,168,106,0.05) 21px)`
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 40%, transparent)' }} />
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: i === 0 ? '1.6rem' : '1.1rem', fontWeight: 400, color: 'var(--white)', marginBottom: '0.3rem' }}>
                {cat.name}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                {cat.count} designs
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .cat-bg { transform-origin: center; }
        a:hover .cat-bg { transform: scale(1.05); }
        @media (max-width: 768px) { .category-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </section>
  )
}
