export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Coupon } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { successResponse, unauthorizedResponse, forbiddenResponse, errorResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

export async function GET(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const query = {}
    if (search) query.code = { $regex: search, $options: 'i' }
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false
    if (status === 'expired') query.endDate = { $lt: new Date() }

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Coupon.countDocuments(query),
    ])

    return paginatedResponse(coupons, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function POST(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()
    if (decoded.role !== 'admin') return forbiddenResponse()

    await dbConnect()
    const body = await request.json()

    const existing = await Coupon.findOne({ code: body.code?.toUpperCase() })
    if (existing) return errorResponse('A coupon with this code already exists')

    const coupon = await Coupon.create(body)
    return successResponse({ coupon }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
