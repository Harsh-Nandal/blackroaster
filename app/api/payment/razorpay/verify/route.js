export const dynamic = 'force-dynamic'

import crypto from 'crypto'
import dbConnect from '@/lib/dbConnect'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { Coupon } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/generateOrderNumber'
import { getStoreSettings } from '@/lib/getStoreSettings'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = await request.json()

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return errorResponse('Payment verification failed. Invalid signature.', 400)
    }

    await dbConnect()

    // Re-calculate totals and build order items (same logic as /api/orders)
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.isActive) {
        return errorResponse(`Product "${item.name}" is no longer available`)
      }

      let price = product.salePrice || product.price
      let stock = product.stock

      if (item.variantId && product.type === 'variable') {
        const variant = product.variants.id(item.variantId)
        if (!variant) return errorResponse('Product variant not found')
        price = variant.salePrice || variant.price
        stock = variant.stock
      }

      if (stock < item.quantity) {
        return errorResponse(`Insufficient stock for "${product.name}"`)
      }

      orderItems.push({
        product: product._id,
        variantId: item.variantId || undefined,
        name: product.name,
        image: product.images?.[0] || '',
        price,
        quantity: item.quantity,
        variant: item.variant || undefined,
      })
      subtotal += price * item.quantity
    }

    // Apply coupon
    let discount = 0
    let couponInfo = null

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      })

      if (coupon) {
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
        } else {
          discount = Math.min(coupon.value, subtotal)
        }
        couponInfo = { code: coupon.code, discount }
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } })
      }
    }

    const { shippingCharge: baseShipping, freeShippingThreshold, taxRate } = await getStoreSettings()
    const shippingCharge = subtotal >= freeShippingThreshold ? 0 : baseShipping
    const tax = Math.round((subtotal - discount) * (taxRate / 100))
    const total = subtotal - discount + shippingCharge + tax

    const orderNumber = await generateOrderNumber()

    const order = await Order.create({
      user: decoded.id,
      orderNumber,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      shippingCharge,
      tax,
      total,
      coupon: couponInfo,
      paymentMethod,
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      notes,
      statusHistory: [{ status: 'placed', note: 'Order placed and payment received via Razorpay' }],
    })

    // Decrement stock
    for (const item of items) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.productId, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity, soldCount: item.quantity } }
        )
      } else {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, soldCount: item.quantity },
        })
      }
    }

    return successResponse({ order, message: 'Payment verified and order placed successfully' }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
