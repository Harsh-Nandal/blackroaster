'use client'

import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlistLocal, selectWishlistItems } from '@/store/slices/wishlistSlice'
import { addToCart } from '@/store/slices/cartSlice'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectWishlistItems)

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      product: {
        _id: item.productId,
        name: item.name,
        images: [item.image],
        price: item.price,
        salePrice: null,
        stock: 99,
        type: 'simple',
      },
      quantity: 1,
    }))
    toast.success(`${item.name} added to cart`)
  }

  const handleRemove = (item) => {
    dispatch(toggleWishlistLocal({
      product: { _id: item.productId, name: item.name, images: [item.image], price: item.price },
    }))
    toast.success('Removed from wishlist')
  }

  return (
    <div style={{ paddingTop: '72px', minHeight: '80vh', background: 'var(--ivory)' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-eyebrow">My List</div>
        <h1 className="page-header-title">Wishlist</h1>
        <p className="page-header-sub">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div style={{ padding: '3.5rem 6vw' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--white)', border: '1px solid var(--grey-mid)', maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ width: '64px', height: '64px', border: '2px solid var(--grey-mid)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', color: 'var(--grey-text)' }}>
              ♡
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Your wishlist is empty</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--grey-text)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Save products you love and come back to them anytime.
            </p>
            <Link href="/shop" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }} className="wishlist-grid">
              {items.map((item, idx) => (
                <div
                  key={item.productId}
                  className="anim-fade-up"
                  style={{ position: 'relative', animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item)}
                    aria-label="Remove from wishlist"
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 1, width: '34px', height: '34px', background: 'rgba(255,255,255,0.95)', border: '1px solid var(--grey-mid)', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--charcoal)'; e.currentTarget.style.color = 'var(--white)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = 'var(--gold)' }}
                  >
                    ♥
                  </button>

                  <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={{ aspectRatio: '3/4', background: 'var(--grey)', marginBottom: '1rem', overflow: 'hidden', position: 'relative' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.04)')}
                          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0ede8, #e0dbd3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--grey-text)' }}>BlackRoaster</div>
                      )}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 400, marginBottom: '0.4rem', color: 'var(--charcoal)' }}>{item.name}</h3>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.85rem' }}>₹{item.price?.toLocaleString('en-IN')}</div>
                  </Link>

                  <button
                    onClick={() => handleAddToCart(item)}
                    style={{ width: '100%', height: '44px', background: 'var(--charcoal)', color: 'var(--white)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600, transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--charcoal)')}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <Link href="/shop" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .wishlist-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px) { .wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 420px) { .wishlist-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
