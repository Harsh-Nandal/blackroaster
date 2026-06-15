'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCartItems,
  selectCartSubtotal,
  applyCoupon,
  removeCoupon,
  clearCart,
} from '@/store/slices/cartSlice'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

const PAYMENT_METHODS = [
  { id: 'cod',        label: 'Cash on Delivery',     icon: '💵' },
  { id: 'upi',        label: 'UPI / QR Code',         icon: '📱' },
  { id: 'card',       label: 'Credit / Debit Card',   icon: '💳' },
  { id: 'netbanking', label: 'Net Banking',            icon: '🏦' },
]

const RAZORPAY_METHODS = ['upi', 'card', 'netbanking']

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function StepHeader({ number, title }) {
  return (
    <div className="checkout-step-label">
      <span className="checkout-step-num">{number}</span>
      {title}
    </div>
  )
}

const CARD_STYLE = {
  background: 'var(--white)',
  border: '1px solid var(--grey-mid)',
  padding: '2rem',
}

const INPUT = {
  height: '48px',
  padding: '0 1rem',
  background: 'var(--ivory)',
  border: '1.5px solid var(--grey-mid)',
  color: 'var(--charcoal)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
}

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)
  const { coupon, couponDiscount } = useSelector((s) => s.cart)
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  const [address, setAddress] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [storeSettings, setStoreSettings] = useState({ shippingCharge: 99, freeShippingThreshold: 999, taxRate: 0 })

  useEffect(() => {
    axios.get('/api/store-settings')
      .then(({ data }) => setStoreSettings(data.settings))
      .catch(() => {})
  }, [])

  const discount = (subtotal * couponDiscount) / 100
  const shipping = subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.shippingCharge
  const tax = Math.round((subtotal - discount) * (storeSettings.taxRate / 100))
  const total = subtotal - discount + shipping + tax
  const taxLabel = storeSettings.taxRate > 0 ? `Tax (${storeSettings.taxRate}%)` : 'Tax'

  const handleAddressChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }))

  const applyCouponCode = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await axios.post('/api/coupons/validate', { code: couponCode, subtotal })
      dispatch(applyCoupon({ code: data.coupon.code, discount: data.coupon.value }))
      toast.success(`Coupon applied! ${data.coupon.value}% off`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const validateForm = () => {
    if (!isAuthenticated) { router.push('/auth/login?redirect=/checkout'); return false }
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all required address fields')
      return false
    }
    return true
  }

  const handleCOD = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/orders', { items, shippingAddress: address, paymentMethod: 'cod', couponCode: coupon || undefined, notes })
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      router.push(`/orders/${data.order._id}?success=true`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpay = async () => {
    setLoading(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) { toast.error('Failed to load payment gateway.'); setLoading(false); return }

      const { data } = await axios.post('/api/payment/razorpay/create-order', { items, couponCode: coupon || undefined })
      const rzpMethodMap = { upi: 'upi', card: 'card', netbanking: 'netbanking' }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: process.env.NEXT_PUBLIC_APP_NAME || 'BlackRoaster',
        description: 'Order payment',
        order_id: data.orderId,
        prefill: { name: address.name, contact: address.phone, email: user?.email || '' },
        method: rzpMethodMap[paymentMethod] ? { [rzpMethodMap[paymentMethod]]: true } : undefined,
        theme: { color: '#C9A86A' },
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post('/api/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items, shippingAddress: address, paymentMethod, couponCode: coupon || undefined, notes,
            })
            dispatch(clearCart())
            toast.success('Payment successful! Order placed.')
            router.push(`/orders/${verifyData.order._id}?success=true`)
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: { ondismiss: () => { toast('Payment cancelled.'); setLoading(false) } },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => { toast.error(`Payment failed: ${response.error.description}`); setLoading(false) })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment')
      setLoading(false)
    }
  }

  const handleOrder = () => {
    if (!validateForm()) return
    RAZORPAY_METHODS.includes(paymentMethod) ? handleRazorpay() : handleCOD()
  }

  if (items.length === 0) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--grey-mid)' }}>🛍</div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--grey-text)' }}>Your cart is empty</p>
        <Link href="/shop" className="btn btn-primary" style={{ textDecoration: 'none' }}>Shop Now</Link>
      </div>
    )
  }

  const isOnlinePayment = RAZORPAY_METHODS.includes(paymentMethod)

  return (
    <div style={{ paddingTop: '72px', background: 'var(--ivory)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-eyebrow">Final Step</div>
        <h1 className="page-header-title">Checkout</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', padding: '3rem 6vw', maxWidth: '1300px', margin: '0 auto' }} className="checkout-grid">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 1: Shipping */}
          <div style={CARD_STYLE}>
            <StepHeader number="1" title="Shipping Address" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" value={address.name} onChange={handleAddressChange} style={INPUT} placeholder="Your name"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input name="phone" value={address.phone} onChange={handleAddressChange} style={INPUT} placeholder="+91 98765 43210"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address Line 1 *</label>
                <input name="line1" value={address.line1} onChange={handleAddressChange} style={INPUT} placeholder="House/Flat no., Street, Colony"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address Line 2</label>
                <input name="line2" value={address.line2} onChange={handleAddressChange} style={INPUT} placeholder="Landmark, Area (optional)"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input name="city" value={address.city} onChange={handleAddressChange} style={INPUT} placeholder="City"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input name="state" value={address.state} onChange={handleAddressChange} style={INPUT} placeholder="State"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group">
                <label className="form-label">PIN Code *</label>
                <input name="pincode" value={address.pincode} onChange={handleAddressChange} style={INPUT} placeholder="6-digit PIN" maxLength={6}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')} onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input name="country" value={address.country} readOnly style={{ ...INPUT, background: 'var(--grey)', color: 'var(--grey-text)', cursor: 'default' }} />
              </div>
            </div>
          </div>

          {/* Step 2: Payment */}
          <div style={CARD_STYLE}>
            <StepHeader number="2" title="Payment Method" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id
                return (
                  <label
                    key={pm.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', border: `1.5px solid ${isSelected ? 'var(--gold)' : 'var(--grey-mid)'}`, cursor: 'pointer', background: isSelected ? '#fdf8ef' : 'transparent', transition: 'all 0.2s' }}
                  >
                    <input type="radio" name="payment" value={pm.id} checked={isSelected} onChange={() => setPaymentMethod(pm.id)} style={{ accentColor: 'var(--gold)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '1rem' }}>{pm.icon}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', flex: 1, color: 'var(--charcoal)', fontWeight: isSelected ? 500 : 400 }}>{pm.label}</span>
                    {RAZORPAY_METHODS.includes(pm.id) && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--grey-text)', textTransform: 'uppercase' }}>Razorpay</span>
                    )}
                  </label>
                )
              })}
            </div>
            {isOnlinePayment && (
              <p style={{ marginTop: '1rem', fontFamily: 'var(--font-ui)', fontSize: '0.7rem', color: 'var(--grey-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.04em' }}>
                🔒 Secured by Razorpay. You'll be redirected to complete payment.
              </p>
            )}
          </div>

          {/* Step 3: Notes */}
          <div style={CARD_STYLE}>
            <StepHeader number="3" title="Order Notes" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions, installation notes, preferred delivery time…"
              style={{ width: '100%', padding: '1rem', background: 'var(--ivory)', border: '1.5px solid var(--grey-mid)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', minHeight: '100px', transition: 'border-color 0.2s' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--grey-mid)')}
            />
          </div>
        </div>

        {/* Right: Order summary */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '2rem', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--grey-mid)' }}>
              Order Summary
            </h2>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '54px', height: '54px', background: 'var(--grey)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--grey-mid)' }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--charcoal)', lineHeight: 1.3 }}>{item.name}</div>
                    {item.variant && <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)', marginTop: '2px' }}>{item.variant.label}</div>}
                    <div style={{ fontSize: '0.8rem', color: 'var(--grey-text)', marginTop: '3px' }}>
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--charcoal)', flexShrink: 0 }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            {!coupon ? (
              <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  style={{ flex: 1, height: '42px', padding: '0 1rem', background: 'var(--ivory)', border: '1.5px solid var(--grey-mid)', borderRight: 'none', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                  onClick={applyCouponCode}
                  disabled={couponLoading}
                  style={{ height: '42px', padding: '0 1rem', background: 'var(--charcoal)', color: 'var(--white)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gold)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--charcoal)')}
                >
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', marginBottom: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✓ {coupon} applied</span>
                <button onClick={() => dispatch(removeCoupon())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.78rem', fontFamily: 'var(--font-ui)' }}>Remove</button>
              </div>
            )}

            {/* Totals */}
            <div style={{ borderTop: '1px solid var(--grey-mid)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN')}` },
                discount > 0 && { label: `Coupon (−${couponDiscount}%)`, value: `−₹${discount.toLocaleString('en-IN')}`, color: '#16a34a' },
                { label: 'Shipping', value: shipping === 0 ? `Free (over ₹${storeSettings.freeShippingThreshold.toLocaleString('en-IN')})` : `₹${shipping}` },
                storeSettings.taxRate > 0 && { label: taxLabel, value: `₹${tax.toLocaleString('en-IN')}` },
              ].filter(Boolean).map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: row.color || 'var(--charcoal)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid var(--charcoal)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                marginTop: '1.5rem',
                background: loading ? 'var(--grey-mid)' : 'var(--charcoal)',
                color: 'var(--white)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--gold)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'var(--charcoal)')}
            >
              {loading
                ? (isOnlinePayment ? 'Opening Payment…' : 'Placing Order…')
                : isOnlinePayment
                  ? `Pay ₹${total.toLocaleString('en-IN')} via Razorpay`
                  : `Place Order · ₹${total.toLocaleString('en-IN')}`
              }
            </button>

            <p style={{ textAlign: 'center', marginTop: '0.9rem', fontFamily: 'var(--font-ui)', fontSize: '0.68rem', color: 'var(--grey-text)', letterSpacing: '0.04em' }}>
              🔒 Secure checkout · Your data is protected
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .checkout-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
