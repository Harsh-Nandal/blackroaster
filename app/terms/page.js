export const metadata = { title: 'Terms & Conditions' }

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      body: 'By placing an order or using the BlackRoaster website, you agree to these terms and conditions. If you do not agree, please do not use our services.',
    },
    {
      title: 'Products & Pricing',
      body: 'All product dimensions, colours, and textures shown on the website are representative. Actual products may vary slightly due to manufacturing tolerances and screen calibration. Prices are in Indian Rupees (INR) and are inclusive of GST unless stated otherwise. Prices may change without notice.',
    },
    {
      title: 'Orders & Payment',
      body: 'Orders are confirmed only upon successful payment. We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay. COD is not available for panel orders above ₹10,000.',
    },
    {
      title: 'Shipping',
      body: 'We ship pan India. Delivery timelines are estimates and may vary due to location, courier availability, or unforeseen circumstances. BlackRoaster is not liable for delays caused by third-party courier services.',
    },
    {
      title: 'Returns & Refunds',
      body: 'Returns are accepted within 7 days of delivery for manufacturing defects only. Products must be unused and in original packaging. Customised or cut-to-size panels are non-returnable. Refunds are processed within 5–7 business days after inspection.',
    },
    {
      title: 'Limitation of Liability',
      body: 'BlackRoaster\'s total liability for any claim shall not exceed the value of the order in question. We are not liable for indirect, incidental, or consequential damages arising from the use of our products.',
    },
    {
      title: 'Governing Law',
      body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chandigarh, Punjab.',
    },
  ]

  return (
    <div style={{ paddingTop: '72px' }}>
      <div className="page-header">
        <div className="page-header-eyebrow">Legal</div>
        <h1 className="page-header-title">Terms & <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Conditions</em></h1>
        <p className="page-header-sub">Last updated: June 2025</p>
      </div>

      <div className="section" style={{ maxWidth: '760px', margin: '0 auto' }}>
        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.75rem', color: 'var(--charcoal)' }}>{s.title}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--grey-text)', lineHeight: 1.9, fontWeight: 300 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
