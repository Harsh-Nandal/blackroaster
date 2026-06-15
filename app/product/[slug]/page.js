'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/store/slices/cartSlice'
import { toggleWishlistLocal, selectIsInWishlist } from '@/store/slices/wishlistSlice'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAttrs, setSelectedAttrs] = useState({}) // { Color: 'Red', Size: 'M' }
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])

  const isWishlisted = useSelector(selectIsInWishlist(product?._id))

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`/api/products/${slug}`)
        setProduct(data.product)

        // Pre-select the default variant (or first available) for variable products
        if (data.product.type === 'variable' && data.product.variants?.length > 0) {
          const initial =
            data.product.variants.find(v => v.isDefault) ||
            data.product.variants.find(v => v.stock > 0) ||
            data.product.variants[0]

          // Set selectedVariant directly so price renders immediately (no flash)
          setSelectedVariant(initial)
          // Also set attrs so the correct attribute buttons appear highlighted
          if (initial?.attributes && Object.keys(initial.attributes).length > 0) {
            setSelectedAttrs(initial.attributes)
          }
        }

        // Fetch reviews
        const reviewRes = await axios.get(`/api/reviews?product=${data.product._id}`)
        setReviews(reviewRes.data.data || [])

        // Fetch related
        if (data.product.category?._id) {
          const relRes = await axios.get(`/api/products?category=${data.product.category._id}&limit=4`)
          setRelated(relRes.data.data?.filter((p) => p._id !== data.product._id) || [])
        }
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchProduct()
  }, [slug])

  // Resolve selectedVariant whenever the user changes selectedAttrs (variable products)
  useEffect(() => {
    if (!product || product.type !== 'variable') return
    const attrNames = (product.attributes || []).map(a => a.name)
    if (!attrNames.length) return

    const allSelected = attrNames.every(name => selectedAttrs[name])
    if (!allSelected) { setSelectedVariant(null); return }

    const matched = (product.variants || []).find(v => {
      const vAttrs = v.attributes || {}
      return attrNames.every(name => vAttrs[name] === selectedAttrs[name])
    })
    setSelectedVariant(prev =>
      prev?._id === matched?._id ? prev : (matched || null)
    )
  }, [selectedAttrs, product])

  // Returns true if choosing `value` for `attrName` leads to at least one variant with stock
  function isValueAvailable(attrName, value) {
    if (!product?.variants) return false
    const testAttrs = { ...selectedAttrs, [attrName]: value }
    return product.variants.some(v => {
      const vAttrs = v.attributes || {}
      return Object.entries(testAttrs).every(([k, val]) => vAttrs[k] === val) && v.stock > 0
    })
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.type === 'variable' && !selectedVariant) {
      const missing = (product.attributes || []).filter(a => !selectedAttrs[a.name]).map(a => a.name)
      if (missing.length) toast.error(`Please select: ${missing.join(', ')}`)
      else toast.error('Selected combination is not available')
      return
    }
    dispatch(addToCart({ product, variant: selectedVariant, quantity }))
    toast.success(`${product.name} added to cart`)
  }

  const handleWishlist = () => {
    if (!product) return
    dispatch(toggleWishlistLocal({ product }))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--grey-text)' }}>Loading…</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Product Not Found</h1>
        <Link href="/shop" style={{ color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Back to Shop →
        </Link>
      </div>
    )
  }

  const isVariable = product.type === 'variable'
  const price = selectedVariant
    ? (selectedVariant.salePrice || selectedVariant.price)
    : (product.salePrice || product.price)
  const originalPrice = selectedVariant ? selectedVariant.price : product.price
  const hasDiscount = price && originalPrice && price < originalPrice
  const images = (selectedVariant?.images?.length ? selectedVariant.images : product.images) || []
  const stock = selectedVariant ? selectedVariant.stock : product.stock

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '1.5rem 6vw', borderBottom: '1px solid var(--grey-mid)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--grey-text)' }}>
          <Link href="/" style={{ color: 'var(--grey-text)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/shop" style={{ color: 'var(--grey-text)', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          {product.category?.name && (
            <>
              <Link href={`/shop?category=${product.category._id}`} style={{ color: 'var(--grey-text)', textDecoration: 'none' }}>{product.category.name}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--charcoal)' }}>{product.name}</span>
        </div>
      </div>

      {/* Product section */}
      <div style={{ padding: '4rem 6vw', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', maxWidth: '1400px', margin: '0 auto' }} className="product-detail-grid">
        {/* Images */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--grey)', marginBottom: '1rem' }}>
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0ede8, #e0dbd3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--grey-text)' }}>
                BlackRoaster
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{ width: '80px', height: '80px', flexShrink: 0, border: `2px solid ${activeImage === i ? 'var(--gold)' : 'transparent'}`, background: 'none', cursor: 'pointer', padding: 0, overflow: 'hidden' }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>
            {product.category?.name}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 400, marginBottom: '1rem', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ color: s <= Math.round(product.rating) ? 'var(--gold)' : 'var(--grey-mid)', fontSize: '0.9rem' }}>★</span>
              ))}
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price — always derived from selectedVariant for variable products */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: hasDiscount ? 'var(--gold)' : 'var(--charcoal)', transition: 'color 0.2s' }}>
              {price ? `₹${price.toLocaleString('en-IN')}` : '—'}
            </span>
            {hasDiscount && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'var(--grey-text)', textDecoration: 'line-through' }}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {isVariable && selectedVariant && hasDiscount && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', background: 'var(--gold)', color: 'var(--charcoal)', padding: '3px 8px', fontWeight: 700 }}>
                {Math.round((1 - price / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--grey-mid)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--grey-dark)', fontWeight: 300 }}>
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Attribute-based variant selectors */}
          {product.type === 'variable' && product.attributes?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              {product.attributes.map(attr => (
                <div key={attr.name} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', marginBottom: '0.6rem' }}>
                    {attr.name}
                    {selectedAttrs[attr.name] && (
                      <span style={{ color: 'var(--charcoal)', fontWeight: 600, marginLeft: '0.5rem' }}>
                        — {selectedAttrs[attr.name]}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(attr.values || []).map(val => {
                      const isSelected = selectedAttrs[attr.name] === val
                      const available = isValueAvailable(attr.name, val)
                      return (
                        <button
                          key={val}
                          onClick={() => {
                            setSelectedAttrs(prev => ({ ...prev, [attr.name]: val }))
                            setActiveImage(0)
                          }}
                          title={available ? val : `${val} — out of stock`}
                          style={{
                            padding: '0.5rem 1.1rem',
                            border: `1.5px solid ${isSelected ? 'var(--charcoal)' : available ? 'var(--grey-mid)' : 'var(--grey-mid)'}`,
                            background: isSelected ? 'var(--charcoal)' : 'transparent',
                            color: isSelected ? 'var(--white)' : available ? 'var(--charcoal)' : 'var(--grey-text)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.78rem',
                            letterSpacing: '0.05em',
                            cursor: available ? 'pointer' : 'not-allowed',
                            opacity: available ? 1 : 0.4,
                            position: 'relative',
                            transition: 'all 0.2s',
                            textDecoration: available ? 'none' : 'line-through',
                          }}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* All attrs selected but no matching variant */}
              {product.attributes.every(a => selectedAttrs[a.name]) && !selectedVariant && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#dc2626', letterSpacing: '0.05em' }}>
                  This combination is not available.
                </p>
              )}
              {/* Not all attrs selected yet */}
              {!product.attributes.every(a => selectedAttrs[a.name]) && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--grey-text)', letterSpacing: '0.05em' }}>
                  Please select all options above.
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-dark)', marginRight: '0.5rem' }}>
              Qty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--grey-mid)' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '44px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
              <span style={{ width: '44px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: '0.9rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))} style={{ width: '40px', height: '44px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: stock > 0 ? 'green' : stock === 0 && isVariable && !selectedVariant ? 'var(--grey-text)' : 'red', letterSpacing: '0.1em', transition: 'color 0.2s' }}>
              {isVariable && !selectedVariant ? '—' : stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              style={{
                flex: 1,
                height: '56px',
                background: 'var(--gold)',
                color: 'var(--charcoal)',
                border: 'none',
                cursor: stock === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 600,
                opacity: stock === 0 ? 0.5 : 1,
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => { if (stock > 0) e.currentTarget.style.background = 'var(--gold-dark)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gold)' }}
            >
              {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              style={{
                width: '56px',
                height: '56px',
                border: '1.5px solid var(--grey-mid)',
                background: isWishlisted ? 'var(--gold)' : 'transparent',
                cursor: 'pointer',
                fontSize: '1.1rem',
                color: isWishlisted ? 'var(--charcoal)' : 'var(--grey-dark)',
                transition: 'all 0.3s',
              }}
            >
              {isWishlisted ? '♥' : '♡'}
            </button>
          </div>

          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', background: 'var(--ivory)', borderLeft: '3px solid var(--gold)' }}>
            {[
              '✓  Free shipping on orders above ₹5,000',
              '✓  10-year warranty on all panels',
              '✓  Easy returns within 7 days',
              '✓  ISO certified fire-retardant material',
            ].map((text) => (
              <p key={text} style={{ fontSize: '0.82rem', color: 'var(--grey-dark)', fontFamily: 'var(--font-body)', margin: 0 }}>
                {text}
              </p>
            ))}
          </div>

          {/* SKU */}
          <p style={{ marginTop: '1rem', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', color: 'var(--grey-text)', letterSpacing: '0.1em' }}>
            SKU: {selectedVariant?.sku || product.sku}
          </p>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications?.length > 0 && (
        <div style={{ padding: '4rem 6vw', borderTop: '1px solid var(--grey-mid)', background: 'var(--ivory)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '2rem' }}>Specifications</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="specs-grid">
            {product.specifications.map((spec, i) => (
              <div key={i} style={{ display: 'flex', borderBottom: '1px solid var(--grey-mid)', padding: '0.75rem 0' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', letterSpacing: '0.05em', color: 'var(--grey-text)', width: '45%', flexShrink: 0 }}>{spec.key}</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--charcoal)', fontWeight: 500 }}>{spec.value}</span>
              </div>
            ))}
          </div>
          <style>{`.specs-grid { @media (max-width: 640px) { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      )}

      {/* Reviews */}
      <div style={{ padding: '4rem 6vw' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '3rem' }}>
          Customer Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--grey-text)', fontFamily: 'var(--font-body)' }}>No reviews yet. Be the first to review this product.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {reviews.map((r) => (
              <div key={r._id} style={{ padding: '2rem', border: '1px solid var(--grey-mid)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{r.user?.name}</span>
                    {r.isVerifiedPurchase && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'green' }}>✓ Verified Purchase</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--grey-text)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '0.75rem' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--gold)' : 'var(--grey-mid)', fontSize: '0.85rem' }}>★</span>)}
                </div>
                {r.title && <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>{r.title}</h4>}
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--grey-dark)', fontWeight: 300 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ padding: '4rem 6vw', background: 'var(--ivory)', borderTop: '1px solid var(--grey-mid)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, marginBottom: '2.5rem' }}>
            You May Also <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Like</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }} className="related-grid">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <style>{`
            @media (max-width: 1024px) { .related-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px) { .related-grid { grid-template-columns: 1fr !important; } }
          `}</style>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .product-detail-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; } }
      `}</style>
    </div>
  )
}
