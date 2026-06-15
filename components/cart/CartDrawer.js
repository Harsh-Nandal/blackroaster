'use client'

import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import {
  closeCart,
  removeFromCart,
  updateQuantity,
  selectCartItems,
  selectCartSubtotal,
  selectCartCount,
} from '@/store/slices/cartSlice'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const cartOpen = useSelector((s) => s.cart.cartOpen)
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const count = useSelector(selectCartCount)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeCart())}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 1500,
          opacity: cartOpen ? 1 : 0,
          pointerEvents: cartOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100vw',
          background: 'var(--white)',
          zIndex: 1600,
          transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.32, 0, 0.67, 0)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 48px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--grey-mid)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--charcoal)' }}>
              Your Cart
            </div>
            {count > 0 && (
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--grey-text)', textTransform: 'uppercase', marginTop: '2px' }}>
                {count} {count === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            aria-label="Close cart"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--grey-text)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--charcoal)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--grey-text)')}
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', border: '2px solid var(--grey-mid)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--grey-text)' }}>
                🛍
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--charcoal)' }}>Your cart is empty</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', lineHeight: 1.6 }}>Add items from the shop to get started</p>
              <Link
                href="/shop"
                onClick={() => dispatch(closeCart())}
                style={{ background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, padding: '0.85rem 2rem', textDecoration: 'none', marginTop: '0.5rem', transition: 'background 0.2s' }}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.variantId}-${idx}`}
                  style={{ display: 'flex', gap: '1rem', padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--grey-mid)' }}
                >
                  {/* Image */}
                  <div style={{ width: '78px', height: '78px', background: 'var(--grey)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--grey-mid)' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    {item.variant && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)', marginBottom: '4px', fontFamily: 'var(--font-ui)' }}>
                        {item.variant.label}
                      </div>
                    )}
                    <div style={{ fontSize: '0.82rem', color: 'var(--gold)', fontFamily: 'var(--font-ui)', marginBottom: '10px', fontWeight: 500 }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>

                    {/* Qty + Remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--grey-mid)' }}>
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity - 1 }))}
                          disabled={item.quantity <= 1}
                          style={{ width: '30px', height: '30px', background: 'none', border: 'none', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.quantity <= 1 ? 0.35 : 1, color: 'var(--charcoal)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => item.quantity > 1 && (e.currentTarget.style.background = 'var(--grey)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          −
                        </button>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', minWidth: '28px', textAlign: 'center', fontWeight: 500 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, variantId: item.variantId, quantity: item.quantity + 1 }))}
                          disabled={item.quantity >= item.stock}
                          style={{ width: '30px', height: '30px', background: 'none', border: 'none', cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.quantity >= item.stock ? 0.35 : 1, color: 'var(--charcoal)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => item.quantity < item.stock && (e.currentTarget.style.background = 'var(--grey)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--charcoal)' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }))}
                          aria-label="Remove item"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-text)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', transition: 'color 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--grey-text)')}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.5rem 1.75rem', borderTop: '1px solid var(--grey-mid)', background: 'var(--ivory)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)' }}>
                Subtotal
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--charcoal)' }}>
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--grey-text)', marginBottom: '1.25rem', letterSpacing: '0.03em' }}>
              Shipping & taxes calculated at checkout
            </p>

            <Link
              href="/checkout"
              onClick={() => dispatch(closeCart())}
              style={{ display: 'block', background: 'var(--charcoal)', color: 'var(--white)', fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, padding: '1rem', textAlign: 'center', textDecoration: 'none', marginBottom: '0.6rem', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--charcoal)')}
            >
              Checkout · ₹{subtotal.toLocaleString('en-IN')}
            </Link>

            <button
              onClick={() => dispatch(closeCart())}
              style={{ display: 'block', width: '100%', border: '1.5px solid var(--grey-mid)', color: 'var(--charcoal)', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, padding: '0.85rem', textAlign: 'center', cursor: 'pointer', background: 'transparent', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--charcoal)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--grey-mid)')}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
