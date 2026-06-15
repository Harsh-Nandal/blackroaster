export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      body: 'We collect your name, email address, phone number, and delivery address when you create an account or place an order. We also collect browsing data (pages visited, time on site) to improve our service.',
    },
    {
      title: 'How We Use Your Information',
      body: 'Your information is used to process orders, send order updates, respond to enquiries, and (with your consent) send promotional emails. We do not sell or rent your personal data to third parties.',
    },
    {
      title: 'Payment Security',
      body: 'All payments are processed securely through Razorpay. BlackRoaster does not store your card details. Razorpay is PCI-DSS compliant.',
    },
    {
      title: 'Cookies',
      body: 'We use cookies to maintain your session, remember your cart, and analyse site traffic via analytics tools. You can disable cookies in your browser settings, though some features may not work correctly.',
    },
    {
      title: 'Data Retention',
      body: 'We retain your account and order data for up to 5 years for accounting and legal purposes. You may request deletion of your account at any time by emailing info@blackroaster.in.',
    },
    {
      title: 'Your Rights',
      body: 'You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at info@blackroaster.in. We will respond within 10 business days.',
    },
    {
      title: 'Contact',
      body: 'For privacy-related questions, email info@blackroaster.in or write to: BlackRoaster, SCO 215, Sector 34-A, Chandigarh – 160022, Punjab, India.',
    },
  ]

  return (
    <div style={{ paddingTop: '72px' }}>
      <div className="page-header">
        <div className="page-header-eyebrow">Legal</div>
        <h1 className="page-header-title">Privacy <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Policy</em></h1>
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
