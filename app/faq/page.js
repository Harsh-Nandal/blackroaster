'use client'

import { useState } from 'react'

export default function FAQPage() {
  const [open, setOpen] = useState(null)

  const FAQS = [
    {
      q: 'What are PVC wall panels?',
      a: 'PVC wall panels are lightweight, rigid sheets made from Polyvinyl Chloride. They are used to cover walls and ceilings to add texture, pattern, or a decorative finish — without plastering, tiling, or painting.',
    },
    {
      q: 'Are the panels waterproof?',
      a: 'Yes. All BlackRoaster panels are 100% waterproof and humidity-resistant, making them ideal for bathrooms, kitchens, basements, and any other wet areas.',
    },
    {
      q: 'Are the panels fire-retardant?',
      a: 'Yes. Our panels carry V0/V2 fire-retardant ratings as per BIS standards, meeting safety requirements for residential and commercial buildings.',
    },
    {
      q: 'How do I install the panels?',
      a: 'Panels can be fixed using construction adhesive (such as Fevicol MR or similar) directly onto a clean, dry wall surface. Some designs also support a click-lock system. Our Installation Guide page has step-by-step instructions.',
    },
    {
      q: 'Can I get custom sizes?',
      a: 'Yes. We offer custom cutting for bulk orders at no extra charge. Contact our sales team with your wall dimensions and we will advise the best panel configuration.',
    },
    {
      q: 'What is the standard panel size?',
      a: 'Most panels come in 2440mm × 1220mm (8ft × 4ft) sheets. Thickness ranges from 5mm to 10mm depending on the design. Individual product pages list exact specifications.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Standard delivery across India takes 5–8 business days. Express options are available for select pin codes. Bulk / project orders are dispatched within 48 hours of confirmation.',
    },
    {
      q: 'What is your return policy?',
      a: 'We accept returns within 7 days of delivery for manufacturing defects. Damage during self-installation is not covered. Please inspect panels at the time of delivery.',
    },
    {
      q: 'Do you offer samples?',
      a: 'Yes. You can request a physical sample via our Contact page. Sample shipping charges apply and are refundable on your first bulk order.',
    },
    {
      q: 'Do you supply to builders and interior designers?',
      a: 'Absolutely. We have a dedicated trade programme with volume pricing for architects, interior designers, and builders. Contact sales@blackroaster.in for trade enquiries.',
    },
  ]

  return (
    <div style={{ paddingTop: '72px' }}>
      <div className="page-header">
        <div className="page-header-eyebrow">Help Centre</div>
        <h1 className="page-header-title">
          Frequently Asked <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Questions</em>
        </h1>
      </div>

      <div className="section" style={{ maxWidth: '760px', margin: '0 auto' }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--grey-mid)' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', textAlign: 'left', padding: '1.5rem 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--charcoal)', fontWeight: 400 }}>{faq.q}</span>
              <span style={{ color: 'var(--gold)', fontSize: '1.2rem', flexShrink: 0, transition: 'transform 0.3s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
            </button>
            {open === i && (
              <p style={{ fontSize: '0.9rem', color: 'var(--grey-text)', lineHeight: 1.8, paddingBottom: '1.5rem', fontWeight: 300 }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
