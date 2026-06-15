'use client'

const WHY_US = [
  {
    icon: '◈',
    title: 'Premium Quality PVC',
    desc: 'Crafted from virgin PVC compounds, our panels meet BIS standards for quality, strength, and safety — tested for every Indian climate.',
  },
  {
    icon: '◉',
    title: 'Easy Installation',
    desc: 'Our click-lock and adhesive-ready panels can be installed by any handyman in hours. No special tools, no heavy construction mess.',
  },
  {
    icon: '◇',
    title: 'Waterproof & Durable',
    desc: '100% waterproof and humidity-resistant, making our panels ideal for bathrooms, kitchens, and high-traffic commercial spaces.',
  },
  {
    icon: '◎',
    title: 'Fire Retardant',
    desc: 'All panels are V0/V2 rated fire retardant, meeting safety norms for residential and commercial use — your safety is our priority.',
  },
  {
    icon: '◈',
    title: 'Eco-Friendly Materials',
    desc: 'Manufactured without toxic heavy metals. Low VOC emission — safe for homes with children, pets, and sensitive individuals.',
  },
  {
    icon: '◉',
    title: 'Custom Sizes Available',
    desc: "Can't find the right fit? We cut panels to your exact specifications at no extra cost for bulk orders. Perfect for any project.",
  },
]

export default function WhyUsSection() {
  return (
    <section className="section" id="why">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <div className="section-eyebrow">Why BlackRoaster</div>
          <h2 className="section-title">
            Built for <em>Better Spaces</em>
          </h2>
        </div>
        <p className="section-subtitle">
          Every panel we make goes through rigorous quality checks before it leaves our facility.
        </p>
      </div>

      <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {WHY_US.map((item, i) => (
          <div
            key={item.title}
            style={{ padding: '2.5rem', background: i % 2 === 0 ? 'var(--ivory)' : 'var(--white)', border: '1px solid var(--grey-mid)', transition: 'border-color 0.3s, box-shadow 0.3s', cursor: 'default' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-mid)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1.2rem' }}>{item.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.75rem' }}>{item.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--grey-text)', lineHeight: 1.8, fontWeight: 300 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) { .why-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .why-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
