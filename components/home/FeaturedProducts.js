'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import ProductCard from '@/components/product/ProductCard'
import ProductSkeleton from '@/components/product/ProductSkeleton'

const TABS = [
  { label: 'Featured', param: 'featured=true' },
  { label: 'New Arrivals', param: 'newArrival=true' },
  { label: 'Best Sellers', param: 'bestSeller=true' },
]

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState(0)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`/api/products?${TABS[activeTab].param}&limit=8`)
        setProducts(data.data || [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeTab])

  return (
    <section className="section" style={{ background: 'var(--ivory)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '2rem',
        }}
      >
        <div>
          <div className="section-eyebrow">Our Collection</div>
          <h2 className="section-title">
            Crafted for <em>Excellence</em>
          </h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0.7rem 1.4rem',
                border: '1.5px solid',
                borderColor: activeTab === i ? 'var(--charcoal)' : 'var(--grey-mid)',
                background: activeTab === i ? 'var(--charcoal)' : 'transparent',
                color: activeTab === i ? 'var(--white)' : 'var(--grey-text)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginRight: '-1.5px',
                fontWeight: 500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
        }}
        className="products-grid"
      >
        {loading ? (
          <ProductSkeleton count={8} />
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--grey-text)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1rem' }}>
              No products found
            </p>
            <Link href="/shop" style={{ color: 'var(--gold)' }}>
              Browse all products →
            </Link>
          </div>
        )}
      </div>

      {/* View all */}
      <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
        <Link
          href="/shop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.72rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--charcoal)',
            textDecoration: 'none',
            borderBottom: '1.5px solid var(--gold)',
            paddingBottom: '4px',
            transition: 'all 0.3s',
          }}
        >
          View All Products
          <span>→</span>
        </Link>
      </div>

      <style>{`
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
