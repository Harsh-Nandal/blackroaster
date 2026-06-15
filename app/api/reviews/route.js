export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/dbConnect'
import { Review } from '@/models/index'
import Product from '@/models/Product'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
  paginatedResponse,
} from '@/lib/apiResponse'

export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const query = { isApproved: true }
    if (productId) query.product = productId

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ])

    return paginatedResponse(reviews, total, page, limit)
  } catch (err) {
    return serverErrorResponse(err)
  }
}

export async function POST(request) {
  try {
    const decoded = await getAuthUser(request)
    if (!decoded) return unauthorizedResponse()

    await dbConnect()
    const { productId, rating, title, comment } = await request.json()

    if (!productId || !rating || !comment) {
      return errorResponse('Product, rating, and comment are required')
    }

    const existing = await Review.findOne({ product: productId, user: decoded.id })
    if (existing) return errorResponse('You have already reviewed this product')

    const review = await Review.create({
      product: productId,
      user: decoded.id,
      rating,
      title,
      comment,
    })

    // Recalculate product rating
    const stats = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      })
    }

    return successResponse({ review, message: 'Review submitted and pending approval' }, 201)
  } catch (err) {
    return serverErrorResponse(err)
  }
}
