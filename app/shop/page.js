'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import ProductCard from '@/components/product/ProductCard'
import ProductSkeleton from '@/components/product/ProductSkeleton'

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
]

const SIDEBAR_LABEL = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.62rem',
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  color: 'var(--grey-dark)',
  marginBottom: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  const page = parseInt(searchParams.get('page') || '1')
  const sort = searchParams.get('sort') || 'newest'
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const featured = searchParams.get('featured') || ''
  const newArrival = searchParams.get('newArrival') || ''

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page)
      params.set('limit', 12)
      params.set('sort', sort)
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (featured) params.set('featured', featured)
      if (newArrival) params.set('newArrival', newArrival)

      const { data } = await axios.get(`/api/products?${params}`)
      setProducts(data.data || [])
      setTotal(data.pagination?.total || 0)
      setPages(data.pagination?.pages || 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, sort, category, search, minPrice, maxPrice, featured, newArrival])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    axios.get('/api/categories').then(({ data }) => setCategories(data.data || [])).catch(() => {})
  }, [])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/shop?${params.toString()}`)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceRange.min) params.set('minPrice', priceRange.min)
    else params.delete('minPrice')
    if (priceRange.max) params.set('maxPrice', priceRange.max)
    else params.delete('maxPrice')
    params.delete('page')
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => { setPriceRange({ min: '', max: '' }); router.push('/shop') }

  const activeFilterCount = [category, minPrice, maxPrice, featured, newArrival].filter(Boolean).length

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--white)' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-eyebrow">
          {search ? `Search: "${search}"` : 'All Products'}
        </div>
        <h1 className="page-header-title">
          {search ? 'Search Results' : 'Our Collection'}
        </h1>
        <p className="page-header-sub">
          {loading ? 'Loading…' : `${total} products`}
          {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '70vh' }} className="shop-layout">
        {/* Sidebar */}
        <aside style={{ padding: '2.5rem 1.75rem', borderRight: '1px solid var(--grey-mid)', background: 'var(--ivory)', position: 'sticky', top: '72px', alignSelf: 'start', maxHeight: 'calc(100vh - 72px)', overflowY: 'auto' }}>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              style={{ width: '100%', marginBottom: '2rem', padding: '0.6rem', background: 'var(--charcoal)', color: 'var(--white)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--charcoal)')}
            >
              <span>×</span> Clear {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}

          {/* Collections */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={SIDEBAR_LABEL}>Collections</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[{ _id: '', name: 'All Collections' }, ...categories].map((cat) => {
                const isActive = category === cat._id
                return (
                  <button
                    key={cat._id || 'all'}
                    onClick={() => updateParam('category', cat._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.88rem',
                      color: isActive ? 'var(--charcoal)' : 'var(--grey-text)',
                      fontWeight: isActive ? 600 : 400,
                      padding: '0.45rem 0.6rem',
                      margin: '1px 0',
                      borderLeft: `2px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                      transition: 'all 0.2s',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--charcoal)'; e.currentTarget.style.borderLeftColor = 'var(--grey-mid)' } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--grey-text)'; e.currentTarget.style.borderLeftColor = 'transparent' } }}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={SIDEBAR_LABEL}>Price Range (₹)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                style={{ height: '40px', padding: '0 0.75rem', background: 'var(--white)', border: '1.5px solid var(--grey-mid)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', width: '100%', transition: 'border-color 0.2s' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')}
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                style={{ height: '40px', padding: '0 0.75rem', background: 'var(--white)', border: '1.5px solid var(--grey-mid)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', width: '100%', transition: 'border-color 0.2s' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')}
              />
            </div>
            <button
              onClick={applyPriceFilter}
              style={{ width: '100%', height: '38px', background: 'var(--charcoal)', color: 'var(--white)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--charcoal)')}
            >
              Apply
            </button>
          </div>

          {/* Quick Filters */}
          <div>
            <div style={SIDEBAR_LABEL}>Quick Filters</div>
            {[
              { label: 'Featured', param: 'featured', value: 'true' },
              { label: 'New Arrivals', param: 'newArrival', value: 'true' },
              { label: 'Best Sellers', param: 'bestSeller', value: 'true' },
            ].map((f) => {
              const isChecked = searchParams.get(f.param) === f.value
              return (
                <label
                  key={f.label}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem', cursor: 'pointer', padding: '0.3rem 0.6rem', borderLeft: `2px solid ${isChecked ? 'var(--gold)' : 'transparent'}`, transition: 'border-color 0.2s' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => updateParam(f.param, e.target.checked ? f.value : '')}
                    style={{ accentColor: 'var(--gold)', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: isChecked ? 'var(--charcoal)' : 'var(--grey-text)', fontFamily: 'var(--font-body)', fontWeight: isChecked ? 600 : 400, transition: 'color 0.2s' }}>
                    {f.label}
                  </span>
                </label>
              )
            })}
          </div>
        </aside>

        {/* Product grid */}
        <div style={{ padding: '2.5rem 2.5rem' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--grey-mid)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', letterSpacing: '0.05em' }}>
              {loading ? '' : `${products.length} of ${total} products`}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)' }}>Sort</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                style={{ height: '38px', padding: '0 2rem 0 0.75rem', border: '1.5px solid var(--grey-mid)', background: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--charcoal)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {category && categories.find(c => c._id === category) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 12px', background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
                  {categories.find(c => c._id === category)?.name}
                  <button onClick={() => updateParam('category', '')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 12px', background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
                  ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                  <button onClick={() => { setPriceRange({ min: '', max: '' }); const p = new URLSearchParams(searchParams.toString()); p.delete('minPrice'); p.delete('maxPrice'); router.push(`/shop?${p}`) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                </span>
              )}
              {featured && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 12px', background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
                  Featured
                  <button onClick={() => updateParam('featured', '')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                </span>
              )}
              {newArrival && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '4px 12px', background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em' }}>
                  New Arrivals
                  <button onClick={() => updateParam('newArrival', '')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="shop-products-grid">
            {loading ? (
              <ProductSkeleton count={12} />
            ) : products.length > 0 ? (
              products.map((p) => <ProductCard key={p._id} product={p} />)
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem', background: 'var(--ivory)', border: '1px dashed var(--grey-mid)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--grey-mid)', marginBottom: '1rem' }}>◇</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--charcoal)', marginBottom: '0.5rem' }}>No products found</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--grey-text)', marginBottom: '1.5rem' }}>Try adjusting your filters</p>
                <button onClick={clearFilters} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Clear All Filters →
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: '4rem', alignItems: 'center' }}>
              {page > 1 && (
                <button
                  onClick={() => updateParam('page', String(page - 1))}
                  style={{ height: '40px', padding: '0 1rem', border: '1.5px solid var(--grey-mid)', background: 'transparent', color: 'var(--grey-dark)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--charcoal)'; e.currentTarget.style.color = 'var(--charcoal)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-mid)'; e.currentTarget.style.color = 'var(--grey-dark)' }}
                >
                  ←
                </button>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  style={{ width: '40px', height: '40px', border: `1.5px solid ${page === p ? 'var(--charcoal)' : 'var(--grey-mid)'}`, background: page === p ? 'var(--charcoal)' : 'transparent', color: page === p ? 'var(--white)' : 'var(--grey-dark)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {p}
                </button>
              ))}
              {page < pages && (
                <button
                  onClick={() => updateParam('page', String(page + 1))}
                  style={{ height: '40px', padding: '0 1rem', border: '1.5px solid var(--grey-mid)', background: 'transparent', color: 'var(--grey-dark)', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--charcoal)'; e.currentTarget.style.color = 'var(--charcoal)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-mid)'; e.currentTarget.style.color = 'var(--grey-dark)' }}
                >
                  →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .shop-layout { grid-template-columns: 1fr !important; }
          .shop-products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .shop-products-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '72px', minHeight: '100vh' }} />}>
      <ShopContent />
    </Suspense>
  )
}
