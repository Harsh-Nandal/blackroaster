export const metadata = {
  title: 'Installation Guide',
  description: 'Step-by-step guide to installing BlackRoaster PVC wall panels.',
}

const STEPS = [
  {
    num: '01',
    title: 'Prepare the Surface',
    desc: 'Ensure the wall is clean, dry, and free from dust, grease, or loose paint. Fill any cracks with wall putty and let it cure completely. A flat, smooth surface gives the best adhesion.',
  },
  {
    num: '02',
    title: 'Measure & Plan',
    desc: 'Measure your wall dimensions carefully. Lay out the panels on the floor first to plan the layout and minimise waste. Mark a horizontal level line on the wall as a reference.',
  },
  {
    num: '03',
    title: 'Cut to Size',
    desc: 'Use a fine-tooth saw or utility knife to cut panels to fit. Always cut from the finished face side to avoid chipping. Wear safety glasses and gloves.',
  },
  {
    num: '04',
    title: 'Apply Adhesive',
    desc: 'Apply a good quality construction adhesive (such as Fevicol MR, Araldite, or a PVC-compatible contact adhesive) in a zigzag pattern on the back of each panel. Leave a 50mm gap from the edges.',
  },
  {
    num: '05',
    title: 'Fix the Panels',
    desc: 'Press the panel firmly against the wall, starting from the bottom and working upward. Use a rubber mallet to tap panels into full contact. Hold in place for 30–60 seconds. For click-lock panels, align the tongue-and-groove edge before pressing.',
  },
  {
    num: '06',
    title: 'Finishing Touches',
    desc: 'Use PVC trim strips or colour-matched edge profiles to cover exposed edges and corners. Wipe off any adhesive residue with a damp cloth before it cures. Allow 24 hours before cleaning or painting adjacent surfaces.',
  },
]

export default function InstallGuidePage() {
  return (
    <div style={{ paddingTop: '72px' }}>
      <div className="page-header">
        <div className="page-header-eyebrow">How To</div>
        <h1 className="page-header-title">
          Installation <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Guide</em>
        </h1>
        <p className="page-header-sub">Simple steps for a professional finish</p>
      </div>

      <div className="section" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="gold-rule" style={{ marginBottom: '3rem' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {STEPS.map((step) => (
            <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 300, color: 'var(--gold)', lineHeight: 1, opacity: 0.6 }}>
                {step.num}
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--charcoal)', marginBottom: '0.75rem' }}>{step.title}</h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--grey-text)', lineHeight: 1.85, fontWeight: 300 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '5rem', padding: '2.5rem', background: 'var(--charcoal)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>Need Help?</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--white)', fontWeight: 300 }}>Our team is happy to assist with your installation questions.</p>
          <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', marginTop: '0.5rem' }}>
            Contact Us →
          </a>
        </div>
      </div>
    </div>
  )
}
