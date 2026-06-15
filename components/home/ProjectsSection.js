import Link from 'next/link'

const COLLECTIONS = [
  { title: '3D Geometric', location: 'Diamond & Hexagon Patterns', type: 'Accent Walls', year: '2024', span: 2 },
  { title: 'Fluted Series', location: 'Vertical Groove Finish', type: 'Living & Bedroom', year: '2024', span: 1 },
  { title: 'Stone Slate', location: 'Natural Rock Texture', type: 'Feature Walls', year: '2024', span: 1 },
  { title: 'Wood Plank', location: 'Oak & Walnut Finish', type: 'Warm Interiors', year: '2024', span: 1 },
  { title: 'Marble White', location: 'Carrara & Statuario', type: 'Luxury Spaces', year: '2024', span: 1 },
  { title: 'Ceiling Tiles', location: 'Drop & Surface Mount', type: 'Full Room Design', year: '2024', span: 2 },
]

export default function CollectionsSection() {
  return (
    <section className="section" style={{ background: 'var(--ivory)' }} id="collections">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div className="section-eyebrow">Our Collections</div>
          <h2 className="section-title">
            Designs That <em>Inspire</em>
          </h2>
        </div>
        <Link href="/shop?view=collections" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--charcoal)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: '3px' }}>
          All Collections →
        </Link>
      </div>

      <div className="masonry-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {COLLECTIONS.map((col, i) => (
          <div
            key={col.title}
            style={{ gridColumn: `span ${col.span}`, position: 'relative', aspectRatio: col.span === 2 ? '16/9' : '4/5', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${135 + i * 15}deg, #1a1610 0%, #0d0b08 100%)`, transition: 'transform 0.6s ease' }} className="project-bg" />
            {/* Panel texture per collection */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: i % 3 === 0
              ? `repeating-linear-gradient(0deg, transparent, transparent 16px, rgba(201,168,106,0.06) 16px, rgba(201,168,106,0.06) 17px), repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(201,168,106,0.04) 16px, rgba(201,168,106,0.04) 17px)`
              : `repeating-linear-gradient(${i * 45}deg, transparent, transparent 25px, rgba(201,168,106,0.05) 25px, rgba(201,168,106,0.05) 26px)`
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
                {col.type} · New {col.year}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: col.span === 2 ? '1.4rem' : '1rem', color: 'var(--white)', fontWeight: 400 }}>
                {col.title}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                {col.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .project-bg { transform-origin: center; }
        div:hover > .project-bg { transform: scale(1.05); }
        @media (max-width: 768px) {
          .masonry-grid { grid-template-columns: 1fr 1fr !important; }
          .masonry-grid > div[style*="span 2"] { grid-column: span 2 !important; }
        }
      `}</style>
    </section>
  )
}
