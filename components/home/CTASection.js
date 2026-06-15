import Link from 'next/link'

export default function CTASection() {
  return (
    <section style={{ background: 'var(--charcoal)', padding: '100px 6vw', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(201,168,106,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem' }}>
          Start Your Project
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--white)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Ready to Transform
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Your Space?</em>
        </h2>

        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.8, marginBottom: '3rem' }}>
          Explore 500+ premium PVC wall panel designs. Waterproof, fire-retardant, and ready to install — delivered across India with expert guidance at every step.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/shop"
            style={{ background: 'var(--gold)', color: 'var(--charcoal)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, padding: '0 2.5rem', height: '56px', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', transition: 'all 0.3s' }}
          >
            Shop Panels →
          </Link>
          <Link
            href="/contact"
            style={{ background: 'transparent', color: 'var(--white)', border: '1.5px solid rgba(255,255,255,0.3)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500, padding: '0 2.5rem', height: '56px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', transition: 'all 0.3s' }}
          >
            Request a Sample
          </Link>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-ui)', letterSpacing: '0.05em' }}>
          Free delivery on orders above ₹5,000 · Custom sizes available · Pan India shipping
        </p>
      </div>
    </section>
  )
}
