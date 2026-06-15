'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearAuthError } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'

function resolveRedirect(user, redirectParam) {
  const isAdmin = user?.role === 'admin'
  if (redirectParam) {
    if (redirectParam.startsWith('/admin') && !isAdmin) return '/'
    return redirectParam
  }
  return isAdmin ? '/admin/dashboard' : '/'
}

function LoginForm() {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading, error, isAuthenticated, user } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(resolveRedirect(user, searchParams.get('redirect')))
    }
    return () => dispatch(clearAuthError())
  }, [isAuthenticated, user, router, searchParams, dispatch])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (!result.error) {
      toast.success('Welcome back!')
      const loggedInUser = result.payload?.user
      router.push(resolveRedirect(loggedInUser, searchParams.get('redirect')))
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
            "Where every wall tells a story of craftsmanship."
          </p>
          <div style={{ marginTop: '2rem', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Premium PVC Wall Panel Manufacturers
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} BlackRoaster
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel anim-fade-in">
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
              My Account
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1 }}>
              Welcome Back
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/auth/forgot-password" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--gold)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

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
                transition: 'background 0.3s',
                marginTop: '0.25rem',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--charcoal)')}
            >
              {loading ? 'Signing In…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--grey-mid)', paddingTop: '1.5rem', marginTop: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--grey-text)' }}>
              New to BlackRoaster?{' '}
              <Link href="/auth/register" style={{ color: 'var(--charcoal)', fontWeight: 600, textDecoration: 'none' }}>
                Create an account →
              </Link>
            </p>
            <p style={{ marginTop: '1rem' }}>
              <Link href="/" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--grey-text)', textDecoration: 'none', letterSpacing: '0.08em' }}>
                ← Back to store
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
