export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Coupon } from '@/models/index'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse'

export async function POST(request) {
  try {
    await dbConnect()
    const { code, subtotal } = await request.json()

    if (!code) return errorResponse('Coupon code is required')

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!coupon) return errorResponse('Invalid or expired coupon code')

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse('This coupon has reached its usage limit')
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return errorResponse(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`)
    }

    return successResponse({
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
      },
    })
  } catch (err) {
    return serverErrorResponse(err)
  }
}
