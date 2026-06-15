'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/store/slices/cartSlice'
import { toggleWishlistLocal } from '@/store/slices/wishlistSlice'
import { selectIsInWishlist } from '@/store/slices/wishlistSlice'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const [hovered, setHovered] = useState(false)
  const isWishlisted = useSelector(selectIsInWishlist(product._id))

  if (!product) return null

  let price, originalPrice, hasDiscount, discountPct, pricePrefix

  if (product.type === 'variable' && product.variants?.length > 0) {
    const hasExplicitDefault = product.variants.some(v => v.isDefault)
    // product.price/salePrice are synced from default variant on save.
    // Fall back to reading variants directly for products saved before this sync was added.
    const src = product.price > 0
      ? product
      : (product.variants.find(v => v.isDefault) || product.variants[0])
    price = src.salePrice || src.price
    originalPrice = src.price
    hasDiscount = src.salePrice && src.salePrice < src.price
    discountPct = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
    pricePrefix = !hasExplicitDefault ? 'From ' : ''
  } else {
    price = product.salePrice || product.price
    originalPrice = product.price
    hasDiscount = product.salePrice && product.salePrice < product.price
    discountPct = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
    pricePrefix = ''
  }

  const image = product.thumbnail || product.images?.[0] || ''
  const image2 = product.images?.[1] || ''

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (product.type === 'variable') {
      window.location.href = `/product/${product.slug}`
      return
    }
    dispatch(addToCart({ product, quantity: 1 }))
    toast.success(`${product.name} added to cart`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    dispatch(toggleWishlistLocal({ product }))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'relative' }}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '3/4',
            overflow: 'hidden',
            background: 'var(--grey)',
            marginBottom: '1.2rem',
          }}
        >
          {image ? (
            <img
              src={hovered && image2 ? image2 : image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s ease, opacity 0.3s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #f0ede8 0%, #e0dbd3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--grey-text)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-ui)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              BR
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {product.isNewArrival && (
              <span
                style={{
                  background: 'var(--charcoal)',
                  color: 'var(--white)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  fontWeight: 600,
                }}
              >
                New
              </span>
            )}
            {hasDiscount && (
              <span
                style={{
                  background: 'var(--gold)',
                  color: 'var(--charcoal)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  padding: '3px 8px',
                  fontWeight: 600,
                }}
              >
                −{discountPct}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '36px',
              height: '36px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s, color 0.3s',
              color: isWishlisted ? 'var(--gold)' : 'var(--grey-dark)',
            }}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>

          {/* Quick add */}
          <button
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(17,17,17,0.9)',
              color: 'var(--white)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.68rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '0.9rem',
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(17,17,17,0.9)')}
          >
            {product.type === 'variable' ? 'Select Options' : 'Add to Cart'}
          </button>
        </div>

        {/* Info */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--grey-text)',
              marginBottom: '0.4rem',
            }}
          >
            {product.category?.name || 'Panel'}
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 400,
              marginBottom: '0.5rem',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 500,
                color: hasDiscount ? 'var(--gold)' : 'var(--charcoal)',
              }}
            >
              {pricePrefix}₹{price?.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  color: 'var(--grey-text)',
                  textDecoration: 'line-through',
                }}
              >
                ₹{originalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: '0.7rem',
                      color: star <= Math.round(product.rating) ? 'var(--gold)' : 'var(--grey-mid)',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)' }}>
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
