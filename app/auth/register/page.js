'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearAuthError } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
    return () => dispatch(clearAuthError())
  }, [isAuthenticated, router, dispatch])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleChange = (e) => {
    setFormError('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }
    const result = await dispatch(registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password }))
    if (!result.error) {
      toast.success('Account created! Welcome to BlackRoaster.')
      router.push('/')
    }
  }

  return (
    <div className="auth-split">
      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <Link
          href="/"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--white)', textDecoration: 'none', position: 'relative', zIndex: 1 }}
        >
          Black<span style={{ color: 'var(--gold)' }}>Roaster</span>
        </Link>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div className="gold-rule" style={{ marginBottom: '2rem' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 1.8vw, 1.55rem)', fontWeight: 300, color: 'var(--white)', lineHeight: 1.55, fontStyle: 'italic', maxWidth: '290px' }}>
            "Life is too short for ordinary walls."
          </p>
          <div style={{ marginTop: '2rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Join the BlackRoaster Community
          </div>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
          {['Member-exclusive designs & prices', 'Order tracking & installation guides', 'Early access to new collections'].map((feat) => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✓</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>{feat}</span>
            </div>
          ))}
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} BlackRoaster
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel anim-fade-in" style={{ alignItems: 'flex-start', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
              New Member
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1 }}>
              Create Account
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="form-input" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className={`form-input${formError ? ' error' : ''}`} placeholder="Repeat password" required />
              </div>
            </div>
            {formError && <p className="form-error">{formError}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '52px',
                background: loading ? 'var(--grey-mid)' : 'var(--charcoal)',
                color: 'var(--white)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: '0.5rem',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--charcoal)')}
            >
              {loading ? 'Creating Account…' : 'Create Account →'}
            </button>

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--grey-text)', lineHeight: 1.6 }}>
              By registering you agree to our{' '}
              <Link href="/terms" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: 'var(--charcoal)', textDecoration: 'underline' }}>Privacy Policy</Link>
            </p>
          </form>

          <div style={{ borderTop: '1px solid var(--grey-mid)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--grey-text)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--charcoal)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
