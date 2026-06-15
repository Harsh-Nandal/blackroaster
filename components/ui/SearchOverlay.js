'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { closeSearch, setSearchQuery } from '@/store/slices/uiSlice'
import axios from 'axios'

export default function SearchOverlay() {
  const dispatch = useDispatch()
  const { searchOpen } = useSelector((s) => s.ui)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (!searchOpen) setQuery('')
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`/api/products?search=${encodeURIComponent(query)}&limit=6`)
        setResults(data.data || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') dispatch(closeSearch()) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dispatch])

  if (!searchOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,10,0.95)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '15vh',
      }}
    >
      <button
        onClick={() => dispatch(closeSearch())}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1.8rem',
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.68rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '2rem',
        }}
      >
        Search Products
      </div>

      <div style={{ width: '100%', maxWidth: '600px', padding: '0 2rem', position: 'relative' }}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search wall panels, ceiling panels, fluted, stone finish…"
          style={{
            width: '100%',
            height: '64px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid var(--gold)',
            color: 'var(--white)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 300,
            padding: '0 4rem 0 1.5rem',
            outline: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: '3rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gold)',
            fontSize: '1.3rem',
          }}
        >
          ⌕
        </span>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '0 2rem',
            marginTop: '1rem',
          }}
        >
          {results.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product.slug}`}
              onClick={() => dispatch(closeSearch())}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,0.06)', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(product.thumbnail || product.images?.[0]) && (
                  <img src={product.thumbnail || product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--white)', fontSize: '0.9rem', fontWeight: 400, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </div>
                <div style={{ color: 'var(--gold)', fontSize: '0.78rem', fontFamily: 'var(--font-ui)' }}>
                  ₹{(product.salePrice || product.price)?.toLocaleString('en-IN')}
                </div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', flexShrink: 0 }}>→</span>
            </Link>
          ))}
          <Link
            href={`/shop?search=${encodeURIComponent(query)}`}
            onClick={() => dispatch(closeSearch())}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '1rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              textDecoration: 'none',
              marginTop: '0.5rem',
            }}
          >
            View all results →
          </Link>
        </div>
      )}

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', marginTop: '2rem' }}>
          Searching…
        </p>
      )}

      {!loading && query && results.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', marginTop: '2rem' }}>
          No results for "{query}"
        </p>
      )}
    </div>
  )
}
