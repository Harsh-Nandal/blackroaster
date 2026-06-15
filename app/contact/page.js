'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CONTACT_INFO = [
  {
    icon: '◎',
    title: 'Address',
    lines: ['SCO 215, Sector 34-A', 'Chandigarh – 160022', 'Punjab, India'],
  },
  {
    icon: '◉',
    title: 'Phone',
    lines: ['+91 98765 43210', '+91 17223 45678'],
  },
  {
    icon: '◈',
    title: 'Email',
    lines: ['info@blackroaster.in', 'sales@blackroaster.in'],
  },
  {
    icon: '◇',
    title: 'Working Hours',
    lines: ['Mon – Sat: 9:00 AM – 6:00 PM', 'Sunday: Closed'],
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/contact', form)
      setSent(true)
      toast.success("Message sent! We'll get back to you soon.")
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const INPUT = {
    height: '48px',
    padding: '0 1rem',
    background: 'var(--white)',
    border: '1.5px solid var(--grey-mid)',
    color: 'var(--charcoal)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-eyebrow">Get In Touch</div>
        <h1 className="page-header-title">
          Let's Talk <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Panels</em>
        </h1>
        <p className="page-header-sub">Mon – Sat, 9 AM – 6 PM IST</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', minHeight: '60vh' }} className="contact-grid">
        {/* Info panel */}
        <div style={{ background: 'var(--ivory)', padding: '4.5rem 4vw 4.5rem 6vw', borderRight: '1px solid var(--grey-mid)' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="gold-rule" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '0.75rem' }}>Our Details</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--grey-text)', lineHeight: 1.8, fontWeight: 300 }}>
              From product questions to bulk orders — our team is here to help you find the perfect panel.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {CONTACT_INFO.map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--charcoal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--gold)', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '0.4rem' }}>
                    {item.title}
                  </div>
                  {item.lines.map((line) => (
                    <div key={line} style={{ fontSize: '0.88rem', color: 'var(--charcoal)', lineHeight: 1.65 }}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--grey-mid)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {['✓ Quick Response', '✓ Free Design Consultation', '✓ Bulk Order Support'].map((badge) => (
              <span key={badge} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.06em' }}>{badge}</span>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div style={{ background: 'var(--white)', padding: '4.5rem 5vw 4.5rem 4vw' }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center', minHeight: '400px' }}>
              <div style={{ width: '64px', height: '64px', background: '#f0fdf4', border: '2px solid #4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#15803d' }}>✓</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--charcoal)', fontWeight: 400 }}>Message Sent!</h2>
              <p style={{ color: 'var(--grey-text)', maxWidth: '360px', lineHeight: 1.8, fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                Thank you for reaching out. Our team will respond within 24 business hours.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'none', border: '1.5px solid var(--charcoal)', color: 'var(--charcoal)', padding: '0.9rem 2rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--charcoal)'; e.currentTarget.style.color = 'var(--white)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--charcoal)' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <div className="gold-rule" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400 }}>Send a Message</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} style={INPUT} placeholder="Full name" required
                    onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} style={INPUT} placeholder="you@example.com" required
                    onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={INPUT} placeholder="+91 98765 43210"
                    onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} style={INPUT} placeholder="e.g. Bulk order inquiry"
                    onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1rem', background: 'var(--white)', border: '1.5px solid var(--grey-mid)', color: 'var(--charcoal)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', minHeight: '140px', transition: 'border-color 0.2s' }}
                  placeholder="Tell us about your project — room type, wall dimensions, design preference, quantity…"
                  required
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ height: '56px', background: loading ? 'var(--grey-mid)' : 'var(--charcoal)', color: 'var(--white)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700, transition: 'background 0.3s' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--gold)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--charcoal)')}
              >
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
