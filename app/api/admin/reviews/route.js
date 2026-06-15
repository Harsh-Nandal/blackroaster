export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Review } from '@/models/index'
import { getAuthUser } from '@/lib/auth'
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse, paginatedResponse } from '@/lib/apiResponse'

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
    const status = searchParams.get('status')
    const rating = searchParams.get('rating')

    const query = {}
    if (status === 'pending') query.isApproved = false
    if (status === 'approved') query.isApproved = true
    if (rating) query.rating = Number(rating)

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('product', 'name slug thumbnail')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ])

    return paginatedResponse(reviews, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
