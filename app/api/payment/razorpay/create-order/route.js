import Razorpay from 'razorpay'
import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'
import { Coupon } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { getStoreSettings } from '@/lib/getStoreSettings'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()

    await dbConnect()
    const { items, couponCode } = await request.json()

    if (!items?.length) return errorResponse('Cart is empty')

    // Calculate subtotal by verifying prices server-side
    let subtotal = 0
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product || !product.isActive) {
        return errorResponse(`Product "${item.name}" is no longer available`)
      }

      let price = product.salePrice || product.price
      if (item.variantId && product.type === 'variable') {
        const variant = product.variants.id(item.variantId)
        if (!variant) return errorResponse('Product variant not found')
        price = variant.salePrice || variant.price
      }

      subtotal += price * item.quantity
    }

    // Apply coupon
    let discount = 0
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
      }
    }

    const { shippingCharge: baseShipping, freeShippingThreshold, taxRate } = await getStoreSettings()
    const shippingCharge = subtotal >= freeShippingThreshold ? 0 : baseShipping
    const tax = Math.round((subtotal - discount) * (taxRate / 100))
    const total = Math.round(subtotal - discount + shippingCharge + tax)

    // Razorpay expects amount in paise
    const rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    return successResponse({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
