export const metadata = {
  title: 'About Us',
  description: 'Learn about BlackRoaster — premium PVC wall panel manufacturers based in Chandigarh, India.',
}

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '72px' }}>
      <div className="page-header">
        <div className="page-header-eyebrow">Our Story</div>
        <h1 className="page-header-title">
          Crafting <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Better Walls</em>
        </h1>
        <p className="page-header-sub">Since 2016 · Chandigarh, India</p>
      </div>

      <div className="section" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="gold-rule" style={{ marginBottom: '2.5rem' }} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 300, lineHeight: 1.8, color: 'var(--charcoal)', marginBottom: '2rem' }}>
          BlackRoaster started with a simple belief — that every Indian home and business deserves walls that look extraordinary without costing a fortune.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--grey-text)', lineHeight: 1.9, fontWeight: 300, marginBottom: '1.5rem' }}>
          Founded in 2016 in Chandigarh, we began as a small manufacturing unit focused on quality PVC wall panels. Over 8 years, we've grown into one of India's most trusted wall panel brands — supplying interior designers, builders, and homeowners across the country.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--grey-text)', lineHeight: 1.9, fontWeight: 300, marginBottom: '1.5rem' }}>
          Every panel we make is manufactured in-house using virgin PVC compounds, ensuring consistent quality and strength. Our products are waterproof, fire-retardant, eco-friendly, and designed to last decades — not just years.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--grey-text)', lineHeight: 1.9, fontWeight: 300 }}>
          With 500+ designs across 3D patterns, fluted series, stone finish, wood finish, ceiling panels and more — we have a solution for every space and every budget.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--grey-mid)' }}>
          {[
            { value: '8+', label: 'Years Manufacturing' },
            { value: '500+', label: 'Panel Designs' },
            { value: '10,000+', label: 'Projects Completed' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--charcoal)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', marginTop: '0.5rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
